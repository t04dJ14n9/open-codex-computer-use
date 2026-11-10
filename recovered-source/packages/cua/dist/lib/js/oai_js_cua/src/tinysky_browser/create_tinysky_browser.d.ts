import type { setupBrowserRuntime } from "@oai/browser";
import type * as T from "../tinysky_alt/types";
type Options = {
    setup_browser_runtime: typeof setupBrowserRuntime;
    read_documentation: T.ReadDocumentation;
};
/** Embed Tinysky in a browser worker using the host's browser service and bundled docs. */
export declare function create_tinysky_browser(options: Options): Promise<T.TinySkyBrowser>;
export {};
