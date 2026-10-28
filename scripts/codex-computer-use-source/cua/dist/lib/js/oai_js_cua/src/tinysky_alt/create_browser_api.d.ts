import type { create_bootstrap_emitter } from "./create_bootstrap_emitter";
import type * as T from "./types";
type Bootstrap = ReturnType<typeof create_bootstrap_emitter>;
type BrowserApi = Required<Pick<T.TinySkyAlt, "browsers" | "getBrowser" | "createBrowserTab" | "getTab" | "listBrowsers" | "listTabs">>;
export declare function create_browser_api(browsers: T.Browsers, bootstrap: Bootstrap): BrowserApi;
export {};
