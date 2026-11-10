import type * as T from "../tinysky_alt/types";
export declare function text(value: string, options?: T.ObservationOptions): Promise<void>;
type ImageOptions = {
    bytes: Uint8Array;
    options?: T.ObservationOptions;
};
export declare function image(args: ImageOptions): Promise<void>;
export {};
