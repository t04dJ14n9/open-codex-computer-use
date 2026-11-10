import type { setupBrowserRuntime } from "@oai/browser";
import type * as T from "./types";
type Options = {
    setupBrowserRuntime: typeof setupBrowserRuntime;
    exclude_browser_confirmations: boolean;
};
export declare function setup_browser(options: Options): Promise<import("@oai/browser").GlobalAgentApi<T.BrowserTab>>;
export {};
