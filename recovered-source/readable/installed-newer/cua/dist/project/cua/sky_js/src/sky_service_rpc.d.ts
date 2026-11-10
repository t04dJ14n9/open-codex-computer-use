import type { SkyServiceRequest } from "./service";
import type * as T from "./types";
export type NodeRepl = {
    rpc?: <Result>(service: string, request: SkyServiceRequest) => Promise<Result>;
};
type DragRequest = Extract<SkyServiceRequest, {
    type: "drag_start" | "drag_move" | "drag_end";
}>;
export declare function create_drag_handle(request: (action: DragRequest) => Promise<void>): {
    start: (point: T.Point) => Promise<void>;
    move_to: (point: T.Point) => Promise<void>;
    end: () => Promise<void>;
};
export declare function invoke<Result>(node_repl: NodeRepl | undefined, request: SkyServiceRequest, target?: T.SkyClient["target"]): Promise<Result>;
export {};
