// Trusted service host. JSONL on stdout is reserved for the Rust supervisor.
const { Console } = require("node:console");
const { realpathSync } = require("node:fs");
const { createRequire, registerHooks } = require("node:module");
const os = require("node:os");
const path = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const { createPrivilegedWorkerRuntime } = require("./privileged-node-repl.js");
const { createResponseMetaTracer } = require("./tracing.js");
const { createWorkerRuntime } = require("./worker-runtime.js");

process.chdir(process.argv[2]);

const stderrConsole = new Console(process.stderr);

// The Windows realpath fallback may preserve a verbatim prefix on only one side.
const canonicalPath = (filename) =>
  path.toNamespacedPath(realpathSync.native(filename));

const configuredServices = JSON.parse(process.env.NODE_REPL_TRUSTED_SERVICES);
const handlers = new Map();
const moduleSearchPaths = (process.env.NODE_REPL_NODE_MODULE_DIRS ?? "")
  .split(path.delimiter)
  .filter(Boolean);
const trustedCodeRoots = (process.env.NODE_REPL_TRUSTED_CODE_PATHS ?? "")
  .split(path.delimiter)
  .filter((entry) => path.isAbsolute(entry))
  .flatMap((root) => {
    try {
      // Native realpath accepts Windows verbatim paths and expands short aliases.
      return [canonicalPath(root)];
    } catch {
      return [];
    }
  });
function isTrustedCodePath(filename) {
  return trustedCodeRoots.some((root) => {
    const relative = path.relative(root, filename);
    return (
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative)
    );
  });
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    if (resolved.url.startsWith("file:")) {
      const filename = canonicalPath(fileURLToPath(resolved.url));
      if (!isTrustedCodePath(filename)) {
        throw new Error(
          `Trusted RPC dependency must resolve within a configured trusted code path: ${specifier}`,
        );
      }
      return { ...resolved, url: pathToFileURL(filename).href };
    }
    return resolved;
  },
});

const env = Object.freeze(
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([, value]) => typeof value === "string",
    ),
  ),
);
const runtime = createWorkerRuntime({
  audioEnabled: process.env.NODE_REPL_ENABLE_AUDIO === "1",
  cwd: process.cwd(),
  env,
  homeDir: process.env.HOME ?? null,
  tmpDir: os.tmpdir(),
});
const { drainExecBackgroundTasks, execContext, getErrorKind, send } = runtime;
const traceEnabled = process.env.NODE_REPL_TRACE_META === "1";
const responseMetaTracer = createResponseMetaTracer({
  enabled: traceEnabled,
  getCurrentExecState: execContext.getCurrent,
});
globalThis.console = runtime.createConsole(stderrConsole);
Object.freeze(runtime.nodeRepl);
const privilegedRuntime = createPrivilegedWorkerRuntime({
  env,
  runtime,
  getTelemetryBridge: () =>
    responseMetaTracer.isEnabled() ? responseMetaTracer.bridge : undefined,
});
Object.defineProperty(globalThis, "nodeRepl", {
  configurable: false,
  enumerable: false,
  value: privilegedRuntime.nodeRepl,
  writable: false,
});
Object.defineProperty(globalThis, "tmpDir", {
  configurable: false,
  enumerable: false,
  value: os.tmpdir(),
  writable: false,
});

function resolveTrustedService(configured) {
  if (configured.startsWith("file:") || path.isAbsolute(configured)) {
    return configured.startsWith("file:")
      ? configured
      : pathToFileURL(configured).href;
  }

  for (const configuredRoot of moduleSearchPaths) {
    try {
      const root = canonicalPath(configuredRoot);
      const resolved = canonicalPath(
        createRequire(path.join(root, "node-repl-trusted.js")).resolve(
          configured,
        ),
      );
      const relative = path.relative(root, resolved);
      if (
        relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative)
      ) {
        return pathToFileURL(resolved).href;
      }
    } catch {
      // Another explicitly configured trusted root may contain the package.
    }
  }

  throw new Error(
    `Trusted RPC package must resolve within a configured trusted module directory: ${configured}`,
  );
}

async function loadHandler(service) {
  let handler = handlers.get(service);
  if (handler === undefined) {
    const configured = configuredServices[service];
    if (typeof configured !== "string") {
      throw new Error(`Trusted RPC service is not configured: ${service}`);
    }
    handler = responseMetaTracer.bridge.withSpan(
      "node_repl.service.load",
      { "node_repl.service": service },
      async () => {
        const module = await import(resolveTrustedService(configured));
        if (typeof module.handleRpc !== "function") {
          throw new Error(
            `Trusted RPC service ${service} does not export handleRpc`,
          );
        }
        return {
          handleRpc: module.handleRpc,
          classifyError: module.classifyError,
        };
      },
    );
    handlers.set(service, handler);
  }
  return await handler;
}

async function runInExecContext(message, operation) {
  const execState = runtime.createExecState(message);
  let errorKind;
  execContext.activate(execState.id);
  const response = {
    type: "trusted_service_response",
    id: message.id,
    output: execState.outputEvents,
    content_items: execState.contentItems,
  };
  const sendResponse = (result) => {
    if (message.type === "run_hooks") {
      const trace = responseMetaTracer.buildTrace(execState);
      if (trace !== null) {
        send({ type: "response_meta_trace", id: execState.id, trace });
      }
    }
    send({ ...response, ...result });
  };
  try {
    const value = await execContext.run(execState, async () => {
      const result = await operation((kind) => {
        if (typeof kind === "string" && kind !== "unknown") errorKind = kind;
      });
      if (message.type !== "run_hooks") {
        await drainExecBackgroundTasks(execState);
      }
      return result ?? null;
    });
    sendResponse({ ok: true, value });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      error_kind: errorKind ?? getErrorKind(error),
    });
  }
}

async function handleServiceRequest(message) {
  await runInExecContext(message, async (setErrorKind) => {
    const { handleRpc, classifyError } = await loadHandler(message.service);
    try {
      return await handleRpc(message.request);
    } catch (error) {
      try {
        if (typeof classifyError === "function") {
          setErrorKind(await classifyError(error));
        }
      } catch {
        // Diagnostic classification must not replace the original failure.
      }
      throw error;
    }
  });
}

function handleNodeReplMessage(message) {
  if (message.type === "turn_ended") {
    const execState = runtime.createExecState(message);
    execContext.activate(execState.id);
    void execContext
      .run(execState, () =>
        privilegedRuntime.turnEndedHandlers.run(Object.freeze(message.event)),
      )
      .finally(() => {
        execContext.clear(execState.id);
        send({ type: "turn_ended_result", id: message.id });
      });
    return;
  }
  if (message.type === "run_hooks") {
    void runInExecContext(message, () =>
      privilegedRuntime.afterSubmittedCodeHooks.run(),
    ).finally(() => {
      execContext.clear(message.exec_id);
    });
    return;
  }
  if (!runtime.settle(message)) {
    privilegedRuntime.nativePipeBridge.handleMessage(message);
  }
}

runtime.listen((message) => {
  if (message.type === "service") {
    void handleServiceRequest(message);
    return;
  }
  handleNodeReplMessage(message);
});
