import type { setupBrowserRuntime } from "@oai/browser";
import type { sky } from "@oai/sky";
type BrowserProvider = Awaited<ReturnType<typeof setupBrowserRuntime>>["browsers"];
type Options = {
    browsers?: BrowserProvider;
    computer?: typeof sky;
};
export declare function get_state(options: Options): Promise<{
    errors?: string[] | undefined;
    apps: import("node_modules/@oai/sky/src/types/window/ListApps").App[] | {
        id: string;
        displayName: string;
        isRunning: boolean;
        windows: import("node_modules/@oai/sky/src/types/full-desktop").Window[];
    }[];
    browsers: ({
        tabs: import("@oai/browser").GlobalAgentBrowserTab[];
        id: string;
        name?: string;
        family?: string;
        type?: "iab" | "extension" | "cdp" | "mcpapps";
        profileName?: string;
        metadata?: {
            extensionInstanceId?: string;
            codexSessionId?: string;
        };
    } | {
        tabs: never[];
        id: string;
        name?: string;
        family?: string;
        type?: "iab" | "extension" | "cdp" | "mcpapps";
        profileName?: string;
        metadata?: {
            extensionInstanceId?: string;
            codexSessionId?: string;
        };
    })[];
}>;
export {};
