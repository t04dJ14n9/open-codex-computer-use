import { mock } from "bun:test";
import type * as T from "../types";
export declare const EXPECTED_CUA_METHOD_NAMES: readonly ["getState", "rewriteDocumentation", "getBrowser", "createBrowserTab", "getApp", "getTab", "listApps", "listBrowsers", "listTabs"];
export declare function load_global_tinysky(): Promise<Required<T.TinySkyAlt>>;
type MockNodeRepl = {
    requestMeta: Record<string, unknown> | undefined;
    write: ReturnType<typeof mock<(text: string, item_id?: string) => void>>;
    emitAudio?: ReturnType<typeof mock<(audio_data_url: string) => Promise<void>>>;
    emitImage: ReturnType<typeof mock<(image: unknown) => Promise<void>>>;
};
export declare function with_repl_globals(callback: (node_repl: MockNodeRepl) => Promise<void>): Promise<void>;
export {};
