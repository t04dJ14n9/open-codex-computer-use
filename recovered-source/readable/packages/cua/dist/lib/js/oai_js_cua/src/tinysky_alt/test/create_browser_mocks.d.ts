import type { setupBrowserRuntime } from "@oai/browser";
import type * as O from "@oai/types";
import type * as T from "../types";
type BrowserSetupOptions = NonNullable<O.Param.First<typeof setupBrowserRuntime>>;
type Options = {
    hide_ax?: boolean;
    hide_click?: boolean;
};
export declare function create_browser_mocks(options?: Options): {
    chrome: {
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
        tab: {
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
        };
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
        documentation: import("bun:test").Mock<() => Promise<string>>;
        visibility: {
            set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
        };
        name_session: import("bun:test").Mock<(_name: string) => Promise<void>>;
        browser: {
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
        };
        info: {
            id: string;
            name: string;
        };
    };
    edge: {
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
        tab: {
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
        };
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
        documentation: import("bun:test").Mock<() => Promise<string>>;
        visibility: {
            set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
        };
        name_session: import("bun:test").Mock<(_name: string) => Promise<void>>;
        browser: {
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
        };
        info: {
            id: string;
            name: string;
        };
    };
    iab: {
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
        tab: {
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
        };
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
        documentation: import("bun:test").Mock<() => Promise<string>>;
        visibility: {
            set: import("bun:test").Mock<(_visible: boolean) => Promise<void>>;
        };
        name_session: import("bun:test").Mock<(_name: string) => Promise<void>>;
        browser: {
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
        };
        info: {
            id: string;
            name: string;
        };
    };
    browsers: Awaited<ReturnType<typeof setupBrowserRuntime>>["browsers"] & {
        decorateTabs(decorateTab: BrowserSetupOptions["decorateTab"]): void;
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
    };
};
export {};
