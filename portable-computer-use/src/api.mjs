// A small, documented JavaScript API over the helper. Fully authored here;
// it has no dependency on any third-party runtime or service.
import { nativeRequest } from "./helper.mjs";

function appSpec(app, windowId) {
  if (!app || typeof app !== "string") throw new Error("app is required");
  return windowId ? `${app}#window=${windowId}` : app;
}

function withTarget(target, params) {
  const result = { ...params };
  if (typeof target === "number" && Number.isFinite(target)) result.element_index = target;
  else if (Array.isArray(target) && target.length >= 2 && target.every(n => typeof n === "number")) {
    result.x = target[0];
    result.y = target[1];
  } else if (target && typeof target === "object") Object.assign(result, target);
  else if (target !== undefined) throw new Error("target must be an element index, [x, y], or an object");
  return result;
}

export function createCua({ write, emitImage, getSignal } = {}) {
  const emit = value => {
    if (typeof write === "function") write(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  };
  const image = async value => {
    if (typeof emitImage === "function") await emitImage(value);
  };
  const call = (method, params = {}) => nativeRequest(method, params, { signal: getSignal?.() });

  const computer = {
    list_apps: () => call("list_apps"),
    get_app_state: params => call("get_app_state", params),
    screenshot: params => call("screenshot", params),
    click: params => call("click", params),
    drag: params => call("drag", params),
    paste: params => call("paste", params),
    press_key: params => call("press_key", params),
    scroll: params => call("scroll", params),
    set_value: params => call("set_value", params),
    select_text: params => call("select_text", params),
    type_text: params => call("type_text", params),
    perform_secondary_action: params => call("perform_secondary_action", params),
    permission_status: () => call("permissionStatus"),
    request_permissions: () => call("requestPermissions"),
    cursor_status: () => call("cursorStatus"),
  };

  function bind(app, windowId) {
    const spec = appSpec(app, windowId);
    const scoped = (params = {}) => ({ ...params, app: spec });
    return {
      app: spec,
      getAXState: async (options = {}) => {
        const state = await computer.get_app_state(scoped({ disableDiff: options.disableDiff ?? false }));
        emit(state.text);
        return state;
      },
      getScreenshot: async () => {
        const state = await computer.get_app_state(scoped());
        if (!state.screenshot) throw new Error("Screenshot unavailable; check Screen Recording permission");
        await image(state.screenshot.url);
        return state;
      },
      getAXStateAndScreenshot: async (options = {}) => {
        const state = await computer.get_app_state(scoped({ disableDiff: options.disableDiff ?? false }));
        emit(state.text);
        if (state.screenshot) await image(state.screenshot.url);
        return state;
      },
      click: (target, extra) => computer.click(withTarget(target, scoped(extra))),
      drag: (from, to, extra) => computer.drag(scoped({ from_x: from?.[0], from_y: from?.[1], to_x: to?.[0], to_y: to?.[1], ...extra })),
      pressKey: (key, extra) => computer.press_key(scoped({ key, ...extra })),
      typeText: (text, extra) => computer.type_text(scoped({ text, ...extra })),
      paste: (text, format = "text", extra) => computer.paste(scoped({ text, format, ...extra })),
      scroll: (target, direction, pages = 1, extra) => computer.scroll(withTarget(target, scoped({ direction, pages, ...extra }))),
      setValue: (target, value, extra) => computer.set_value(withTarget(target, scoped({ value, ...extra }))),
      selectText: (target, text, extra) => computer.select_text(withTarget(target, scoped({ text, ...extra }))),
      performSecondaryAction: (target, action, extra) => computer.perform_secondary_action(withTarget(target, scoped({ action, ...extra }))),
    };
  }

  return {
    computer,
    bind,
    listApps: async () => {
      const apps = await computer.list_apps();
      emit(JSON.stringify(apps, null, 2));
      return apps;
    },
    getApp: async (app, windowId) => {
      const handle = bind(app, windowId);
      emit(`Bound ${handle.app}`);
      return handle;
    },
    permissionStatus: () => computer.permission_status(),
    requestPermissions: () => computer.request_permissions(),
  };
}
