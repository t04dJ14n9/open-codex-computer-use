// Persistent JavaScript session for the `js` tool. It is a plain Node VM
// context with a documented `cua` API and `nodeRepl` output helpers; no
// external runtime, supervisor or signed binary is involved.
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCua } from "./api.mjs";

const MAX_OUTPUT_CHARS = 4 * 1024 * 1024;

function format(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  try { return JSON.stringify(value, null, 2) ?? String(value); }
  catch { return String(value); }
}

// Top-level `var`/`let`/`const` names are exported to the persistent context
// so they remain visible in later `js` calls. Complex destructuring should use
// `nodeRepl.state` or `globalThis` explicitly.
function declaredNames(code) {
  const names = new Set();
  const pattern = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)*)/g;
  let match;
  while ((match = pattern.exec(code)) !== null) {
    for (const raw of match[1].split(",")) {
      const name = raw.trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  }
  return [...names];
}

async function imageBytes(input) {
  let bytes;
  let mimeType = "image/png";
  if (typeof input === "string") {
    if (input.startsWith("data:")) {
      const match = /^data:([^;,]+);base64,(.*)$/s.exec(input);
      if (!match) throw new Error("Unsupported data URL");
      mimeType = match[1];
      bytes = Buffer.from(match[2], "base64");
    } else {
      bytes = await readFile(input.startsWith("file://") ? fileURLToPath(input) : input);
    }
  } else if (input && typeof input === "object" && "bytes" in input) {
    bytes = input.bytes;
    mimeType = input.mimeType || input.mime_type || mimeType;
  } else if (input && typeof input === "object" && "url" in input) {
    return imageBytes(input.url);
  } else if (Buffer.isBuffer(input) || input instanceof Uint8Array) {
    bytes = input;
  } else {
    throw new Error("emitImage expects a file/data URL, bytes, or { bytes, mimeType }");
  }
  return { data: Buffer.from(bytes).toString("base64"), mimeType };
}

export function createRuntime() {
  let context;
  let state;
  let output;
  let emit;
  let controller = null;

  function reset() {
    state = {};
    output = [];
    const write = value => {
      const text = format(value);
      output.push({ type: "text", text });
      return text;
    };
    const emitImage = async input => {
      const { data, mimeType } = await imageBytes(input);
      output.push({ type: "image", data, mimeType });
    };
    emit = { write };
    const cua = createCua({ write, emitImage, getSignal: () => controller?.signal });
    const consoleShim = {
      log: (...args) => write(args.map(format).join(" ")),
      info: (...args) => write(args.map(format).join(" ")),
      warn: (...args) => write(args.map(format).join(" ")),
      error: (...args) => write(args.map(format).join(" ")),
      debug: () => {},
    };
    context = vm.createContext({
      console: consoleShim,
      Buffer, Uint8Array, ArrayBuffer, DataView,
      setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, structuredClone,
      URL, URLSearchParams, TextEncoder, TextDecoder, AbortController, AbortSignal,
      Date, Math, JSON, Promise, Error, TypeError, RangeError, Map, Set, WeakMap, WeakSet,
      cua, state,
      nodeRepl: {
        write,
        emitImage,
        state,
        readFile: async location => readFile(location.startsWith("file://") ? fileURLToPath(location) : location),
        async rpc() { throw new Error("No external RPC services; use the cua API"); },
      },
      // Dynamic `import()` is syntax, so it is rewritten to this shim in
      // `execute` rather than requiring --experimental-vm-modules.
      __import: specifier => import(specifier),
    });
  }

  reset();

  async function execute(code, { timeoutMs = 120000, signal } = {}) {
    if (typeof code !== "string" || !code.trim()) return { content: [] };
    output = [];
    controller = new AbortController();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const transformed = code.replace(/\bimport\s*\(/g, "__import(");
    const exports = declaredNames(transformed)
      .map(name => `if (typeof ${name} !== "undefined") { try { globalThis.${name} = ${name}; } catch {} }`)
      .join(" ");
    const wrapped = `(async () => {\n${transformed}\n;${exports}\n})()`;
    let work;
    try {
      const script = new vm.Script(wrapped, { filename: "computer-use.js" });
      // A Promise.race deadline cannot fire while the event loop is blocked by
      // a synchronous infinite loop (`while(true){}`). Node's VM `timeout`
      // runs a watchdog OUTSIDE that loop, so it can terminate the script and
      // leave the MCP process responsive for `status` / `js_reset`.
      // It bounds only synchronous execution: `await cua.listApps()` still
      // resolves normally through host promises, and the async deadline below
      // remains the bound for genuinely asynchronous work.
      const syncTimeoutMs = Math.max(1, Math.min(Math.floor(timeoutMs), 120000));
      work = Promise.resolve(script.runInContext(context, { timeout: syncTimeoutMs }));
    } catch (error) {
      controller = null;
      const message = error.code === "ERR_SCRIPT_EXECUTION_TIMEOUT"
        ? `JavaScript execution exceeded ${timeoutMs} ms (synchronous VM timeout)`
        : error.message;
      return { isError: true, content: [{ type: "text", text: message }] };
    }
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`JavaScript execution exceeded ${timeoutMs} ms`)), timeoutMs);
    });
    let value;
    try {
      value = await Promise.race([work, deadline]);
    } catch (error) {
      controller.abort();
      controller = null;
      return { isError: true, content: [{ type: "text", text: error.message }] };
    } finally {
      clearTimeout(timer);
      controller = null;
    }
    if (output.length === 0 && value !== undefined) emit.write(value);
    const size = output.reduce((total, item) => total + (item.text?.length ?? item.data?.length ?? 0), 0);
    if (size > MAX_OUTPUT_CHARS) return { isError: true, content: [{ type: "text", text: "Output too large" }] };
    return { content: output };
  }

  return { execute, reset, get state() { return state; } };
}
