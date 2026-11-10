import type { GlobalAgentApi } from "@oai/browser";
export declare function get_browsers(browser_provider: GlobalAgentApi["browsers"]): Promise<{
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
    errors: string[];
}>;
