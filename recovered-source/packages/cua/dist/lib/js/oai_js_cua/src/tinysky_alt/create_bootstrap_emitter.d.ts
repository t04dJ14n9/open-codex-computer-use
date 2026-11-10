import type * as T from "./types";
type Options = {
    documentation: T.Documentation;
    target: T.DocumentationTarget;
};
export declare function create_bootstrap_emitter(args: Options): {
    load_browser_documentation: (browser: T.Browser) => Promise<void>;
    emit: (result?: unknown, options?: T.ObservationOptions & {
        browser?: T.Browser;
    }) => Promise<void>;
    rewrite_documentation: () => Promise<void>;
};
export {};
