import type * as T from "../tinysky_alt/types";
type Computer = Pick<T.LinuxComputer, "get_screenshot" | "click" | "drag" | "scroll" | "press_key">;
export declare function create_tinysky_vision_only(computer: Computer): {
    screenshot(): Promise<Uint8Array<ArrayBufferLike>>;
    click(point: T.Point, options?: Pick<T.ClickOptions, "mouseButton" | "clickCount">): import("node_modules/@oai/sky/src/types/full-desktop/Click").Return;
    drag(from: T.Point, to: T.Point): import("node_modules/@oai/sky/src/types/full-desktop/Drag").Return;
    scroll(point: T.Point, direction: T.Direction, distance?: {
        pixels: number;
    }): import("node_modules/@oai/sky/src/types/full-desktop/Scroll").Return;
    pressKey(key: string): import("node_modules/@oai/sky/src/types/full-desktop/PressKey").Return;
    typeText(text: string): Promise<void>;
};
export {};
