import type * as T from "./types";
export declare function bind_windows_app(computer: T.WindowsComputer, window: Awaited<ReturnType<T.WindowsComputer["get_window"]>>): T.App;
