import { create_tinysky_alt } from "../create_tinysky_alt";
import type { setupBrowserRuntime } from "@oai/browser";
import type * as O from "@oai/types";
import type * as T from "../types";
import type { create_browser_mocks } from "./create_browser_mocks";
type BrowserSetupOptions = NonNullable<O.Param.First<typeof setupBrowserRuntime>>;
type MockProviders = {
    browsers?: ReturnType<typeof create_browser_mocks>["browsers"];
    computer?: T.Computer;
};
type TestTinysky = Required<Awaited<ReturnType<typeof create_tinysky_alt>>>;
export declare function create_test_tinysky(args: MockProviders): Promise<TestTinysky>;
export declare function install_mocks(args: MockProviders): {
    agent: {
        browsers: (import("@oai/browser").GlobalAgentApiBrowsers<T.BrowserTab> & {
            decorateTabs(decorateTab: ((tab: T.BrowserTab) => void) | undefined): void;
            get: import("bun:test").Mock<(id: string) => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            getDefault: import("bun:test").Mock<() => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            getForUrl: import("bun:test").Mock<() => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            list: import("bun:test").Mock<() => Promise<T.BrowserInfo[]>>;
        }) | undefined;
        documentation: {
            get: import("bun:test").Mock<(name: string) => Promise<string>>;
        };
    };
    setup_browser_runtime: import("bun:test").Mock<(options?: BrowserSetupOptions) => Promise<{
        browsers: (import("@oai/browser").GlobalAgentApiBrowsers<T.BrowserTab> & {
            decorateTabs(decorateTab: ((tab: T.BrowserTab) => void) | undefined): void;
            get: import("bun:test").Mock<(id: string) => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            getDefault: import("bun:test").Mock<() => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            getForUrl: import("bun:test").Mock<() => Promise<{
                browserId: string;
                documentation: import("bun:test").Mock<() => Promise<string>>;
                tabs: {
                    get: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                    list: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    new: import("bun:test").Mock<() => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                user: {
                    openTabs: import("bun:test").Mock<() => Promise<import("@oai/browser").GlobalAgentBrowserTab[]>>;
                    claimTab: import("bun:test").Mock<(_tab: import("@oai/browser").GlobalAgentBrowserTab) => Promise<{
                        id: string;
                        ax: {
                            get: import("bun:test").Mock<(mode?: "state" | "screenshot" | "both") => Promise<string | Uint8Array<ArrayBuffer> | {
                                state: string;
                                screenshot: Uint8Array<ArrayBuffer>;
                            }>>;
                            click: import("bun:test").Mock<() => Promise<void>>;
                            pressKey: import("bun:test").Mock<() => Promise<void>>;
                            typeText: import("bun:test").Mock<() => Promise<void>>;
                            paste: import("bun:test").Mock<() => Promise<void>>;
                            scroll: import("bun:test").Mock<() => Promise<void>>;
                        };
                        playwright: {
                            domSnapshot: import("bun:test").Mock<() => Promise<string>>;
                        };
                        screenshot: import("bun:test").Mock<() => Promise<Uint8Array<ArrayBuffer>>>;
                        close: import("bun:test").Mock<() => Promise<void>>;
                        goto: import("bun:test").Mock<() => Promise<void>>;
                        markDeliverable: import("bun:test").Mock<() => Promise<void>>;
                        markHandoff: import("bun:test").Mock<() => Promise<void>>;
                    }>>;
                };
                nameSession: import("bun:test").Mock<(_name: string) => Promise<void>> | undefined;
                capabilities: {
                    get(capability: string): Promise<{
                        set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
                    }>;
                };
            }>>;
            list: import("bun:test").Mock<() => Promise<T.BrowserInfo[]>>;
        }) | undefined;
        documentation: {
            get: import("bun:test").Mock<(name: string) => Promise<string>>;
        };
    }>>;
};
export declare function create_mac_computer_mock(): T.MacComputer & {
    target: "mac";
    get_app_state: import("bun:test").Mock<(options: O.Param.First<T.MacComputer["get_app_state"]>) => Promise<{
        app: string;
        text: string;
        screenshot: null;
    }>>;
    list_apps: import("bun:test").Mock<() => Promise<{
        id: string;
    }[]>>;
    click: import("bun:test").Mock<() => Promise<void>>;
    press_key: import("bun:test").Mock<() => Promise<void>>;
    paste: import("bun:test").Mock<() => Promise<void>>;
    scroll: import("bun:test").Mock<() => Promise<void>>;
};
export {};
