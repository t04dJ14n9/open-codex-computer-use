import type * as O from "@oai/types";
import type * as T from "./types";
export declare function bind_linux_app(computer: T.LinuxComputer, window: O.ArrayItem<Awaited<ReturnType<T.LinuxComputer["list_windows"]>>>): T.App;
