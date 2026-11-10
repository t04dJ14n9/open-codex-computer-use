import type { sky } from "@oai/sky";
export type Computer = typeof sky;
export type LinuxComputer = Extract<Computer, {
    target: "linux";
}>;
export type MacComputer = Extract<Computer, {
    target: "mac";
}>;
export type WindowsComputer = Extract<Computer, {
    target: "windows";
}>;
export type NodeReplGlobals = typeof globalThis & {
    nodeRepl?: {
        env?: Record<string, string | undefined>;
        requestMeta?: Record<string, unknown>;
        emitAudio?: (audio_data_url: string) => Promise<void> | void;
        emitImage?: (image: Uint8Array) => Promise<void> | void;
        write?: (text: string, itemId?: string) => Promise<void> | void;
    };
};
