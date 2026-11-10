"use strict";
var webMcp = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../browser-client/src/webmcp/page.ts
  var page_exports = {};
  __export(page_exports, {
    WEBMCP_PROBE_FRAME_NAME: () => WEBMCP_PROBE_FRAME_NAME,
    invokeTool: () => invokeTool,
    readTools: () => readTools
  });

  // ../browser-common/src/webmcp/native-tools.ts
  async function readNativeWebMcpFrameTools() {
    const modelContext = Reflect.get(document, "modelContext");
    if (!modelContext || typeof modelContext.getTools !== "function" || globalThis.origin === "null")
      return [];
    try {
      return (await modelContext.getTools()).filter(
        (tool) => tool.window === window && tool.origin !== "null"
      );
    } catch (error) {
      if (error != null && typeof error === "object" && "name" in error && (error.name === "NotAllowedError" || error.name === "SecurityError"))
        return [];
      throw error;
    }
  }
  function describeNativeWebMcpTool(tool) {
    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema: typeof tool.inputSchema === "string" ? JSON.parse(tool.inputSchema) : tool.inputSchema ?? null,
      annotations: tool.annotations,
      origin: tool.origin
    };
  }

  // ../browser-client/src/webmcp/page.ts
  var NATIVE_STATE_KEY = "__codexNativeWebMcpState";
  var WEBMCP_PROBE_FRAME_NAME = "codex-webmcp-probe-97adecab-75be-4770-bbe4-654cac643843";
  async function readTools({
    frameUrl,
    generation,
    pageUrl,
    staleRegistrationError,
    useChromiumCrashWorkaround
  }) {
    if (location.href !== frameUrl) throw new Error(staleRegistrationError);
    const modelContext = useChromiumCrashWorkaround ? await getNativeWebMcpContext() : document.modelContext;
    if (!modelContext || typeof modelContext.getTools !== "function" || globalThis.origin === "null")
      return [];
    const state = Reflect.get(globalThis, NATIVE_STATE_KEY) ?? {
      handles: /* @__PURE__ */ new Map(),
      registrationIds: /* @__PURE__ */ new Map(),
      generation,
      listening: false
    };
    Reflect.set(globalThis, NATIVE_STATE_KEY, state);
    if (state.generation !== generation) {
      if (state.generation > generation) throw new Error(staleRegistrationError);
      state.handles.clear();
      state.registrationIds = /* @__PURE__ */ new Map();
      state.generation = generation;
    }
    if (!state.listening) {
      modelContext.addEventListener("toolchange", () => {
        state.handles.clear();
        state.registrationIds = /* @__PURE__ */ new Map();
      });
      state.listening = true;
    }
    const registrations = state.registrationIds;
    const tools = await readNativeWebMcpFrameTools();
    if (location.href !== frameUrl || registrations !== state.registrationIds)
      throw new Error(staleRegistrationError);
    return tools.map((tool) => {
      const metadata = describeNativeWebMcpTool(tool);
      const descriptor = toolDescriptor(tool);
      let id = registrations.get(tool.name);
      if (id != null && state.handles.get(id)?.descriptor !== descriptor) {
        state.handles.delete(id);
        id = void 0;
      }
      if (id == null) {
        id = crypto.randomUUID();
        registrations.set(tool.name, id);
      }
      state.handles.set(id, { tool, descriptor });
      return {
        name: tool.name,
        call_name: tool.name + "__" + id,
        registration_id: id,
        title: tool.title,
        description: tool.description,
        input_schema: metadata.inputSchema,
        annotations: tool.annotations,
        origin: tool.origin,
        // Guardian needs the top-level page URL separately from the actual tool owner.
        pageUrl
      };
    });
  }
  async function invokeTool({
    registrationId,
    generation,
    inputJson,
    timeoutMs,
    staleRegistrationError
  }) {
    const modelContext = document.modelContext;
    const state = Reflect.get(
      globalThis,
      NATIVE_STATE_KEY
    );
    const handle = state?.handles.get(registrationId);
    const tool = handle?.tool;
    if (!modelContext || !state || !tool || state.generation !== generation)
      throw new Error(staleRegistrationError);
    if (globalThis.origin === "null" || tool.origin === "null")
      throw new Error("Opaque-origin WebMCP tools are not allowed.");
    const registrations = state.registrationIds;
    const tools = await modelContext.getTools();
    if (registrations !== state.registrationIds || !state.handles.has(registrationId) || !tools.some(
      (current) => current.window === window && current.window === tool.window && current.name === tool.name && current.origin === tool.origin && toolDescriptor(current) === handle?.descriptor
    ))
      throw new Error(staleRegistrationError);
    const arity = modelContext.executeTool.length;
    if (arity !== 1 && arity !== 2)
      throw new Error("Unsupported native WebMCP executeTool signature.");
    const input = JSON.parse(inputJson);
    return await modelContext.executeTool(
      tool,
      arity === 2 ? JSON.stringify(input) : input,
      timeoutMs == null ? void 0 : { signal: AbortSignal.timeout(timeoutMs) }
    );
  }
  async function getNativeWebMcpContext() {
    if (!("modelContext" in document) || globalThis.origin === "null" || document.documentElement == null)
      return;
    const ownerDocument = document;
    const host = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    host.style.setProperty("display", "none", "important");
    const frame = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "iframe"
    );
    frame.name = WEBMCP_PROBE_FRAME_NAME;
    host.attachShadow({ mode: "closed" }).append(frame);
    try {
      document.documentElement.append(host);
      if (frame.contentDocument == null) return;
      const probe = Reflect.get(
        frame.contentDocument,
        "modelContext"
      );
      if (probe == null || typeof probe.getTools !== "function") return;
      const tools = await probe.getTools();
      if (ownerDocument === document && tools.some((tool) => tool.window === window && tool.origin !== "null"))
        return ownerDocument.modelContext;
    } catch (error) {
      if (error != null && typeof error === "object" && "name" in error && (error.name === "NotAllowedError" || error.name === "SecurityError"))
        return;
      throw error;
    } finally {
      host.remove();
    }
  }
  function toolDescriptor(tool) {
    return JSON.stringify([
      tool.name,
      tool.origin,
      tool.title,
      tool.description,
      describeNativeWebMcpTool(tool).inputSchema,
      tool.annotations
    ]);
  }
  return __toCommonJS(page_exports);
})();
