# `browser-accessibility.wat` — bounded structural summary

> **Bounded derivative.** This document summarizes a *generated* WAT text
> disassembly (`wasm2wat` output); it is **not author source** (not Swift/Rust/
> TypeScript). The full WAT remains available at its original path:
> `scripts/codex-computer-use-source/readable-browser/wasm/browser-accessibility.wat`.

- Source byte size: **202768105** bytes
- Source SHA-256: `0c3a0d52906550f80f6fa8157ab057cfad5eee5fe809d7b93b5403bf3b794d8a`

## First ~120 lines (verbatim, each truncated at 300 characters)

````text
(module
  (type (;0;) (func (param i32 i32 i32) (result i32)))
  (type (;1;) (func (param i32 i32)))
  (type (;2;) (func (param i32 i32 i32)))
  (type (;3;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;4;) (func (param i32 i32 i32 i32 i32 i32 i32)))
  (type (;5;) (func (param i32 i32 i32 i32)))
  (type (;6;) (func (result i32)))
  (type (;7;) (func (param i32 i32 i32 i32 i32)))
  (type (;8;) (func (param i32 i32 i32 i32) (result i32)))
  (type (;9;) (func (param i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;10;) (func (param i32 i32 i32 i32 i32 i32)))
  (type (;11;) (func (param i32 i32) (result i32)))
  (type (;12;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;13;) (func (param i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;14;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;15;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;16;) (func (param i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;17;) (func (param i32 i32 i32 i32 i32) (result i32)))
  (type (;18;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;19;) (func (param i32 i32 i32 i32) (result i64)))
  (type (;20;) (func (param f64 i32 i32 i32 i32 i32)))
  (type (;21;) (func (param f32 i32 i32 i32 i32 i32)))
  (type (;22;) (func (param i64 i32 i32 i32 i32 i32)))
  (type (;23;) (func (param i64 i64 i32 i32 i32 i32 i32)))
  (type (;24;) (func (param i32 i32 i32 i32 i32) (result f64)))
  (type (;25;) (func (param i32 i32 i32 i32 i32) (result f32)))
  (type (;26;) (func (param i32 i32 i32 i32 i32) (result i64)))
  (type (;27;) (func (param f64 i32 i32 i32 i32)))
  (type (;28;) (func (param f32 i32 i32 i32 i32)))
  (type (;29;) (func (param i64 i32 i32 i32 i32)))
  (type (;30;) (func (param i64 i64 i32 i32 i32 i32)))
  (type (;31;) (func (param i32 i32 i32 i32) (result f64)))
  (type (;32;) (func (param i32 i32 i32 i32) (result f32)))
  (type (;33;) (func (param i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;34;) (func (param i32)))
  (type (;35;) (func (param i32 f32 i32 i32 i32 i32)))
  (type (;36;) (func (param i32 f64 i32 i32 i32 i32)))
  (type (;37;) (func (param i32) (result i32)))
  (type (;38;) (func (param i64 i64 i32 i32)))
  (type (;39;) (func (param i32 i64 i32 i64 i32 i32 i32 i32 i32)))
  (type (;40;) (func (param i32 i64 i32 i32 i32 i32 i32)))
  (type (;41;) (func (param i32 i64 i32 i32 i32 i32)))
  (type (;42;) (func (param i32 i64 i32 i64 i32 i32)))
  (type (;43;) (func (param i32 i64 i64 i64 i64 i32 i32)))
  (type (;44;) (func (param i32 i64 i64 i32 i32)))
  (type (;45;) (func (param i32 i32 i64 i64 i64 i64 i32 i32)))
  (type (;46;) (func (param i32 i32 i64 i64 i64 i64 i64 i64 i32 i32)))
  (type (;47;) (func (param i32 i64 i64 i64 i32 i32) (result i64)))
  (type (;48;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;49;) (func (param i32 f32 f32 f32 f32 i32 i32 i32 i32)))
  (type (;50;) (func (param i32 i32 i32 i32 i32 i32) (result f64)))
  (type (;51;) (func (param i32 i64 i64)))
  (type (;52;) (func (param i32 i32 i64 i64)))
  (type (;53;) (func (param i32 i32 i32 i32 i64 i64 i64 i32 i32)))
  (type (;54;) (func (param i32 i32 i32 i32 i64 i64 i32 i32)))
  (type (;55;) (func (param i32 i64 i64 i32 i32 i32 i32 i32)))
  (type (;56;) (func (param i32 i32 i32 i32 i64 i64 i64 i32 i32 i32 i32)))
  (type (;57;) (func (param i32 f64 i32 i32) (result i32)))
  (type (;58;) (func (param i32 f64 i32 i32 i32 i32) (result i32)))
  (type (;59;) (func (param i32 i32) (result f64)))
  (type (;60;) (func (param i32 i32 i32) (result i64)))
  (type (;61;) (func (param i32 f64 i32 i32 i32 i32 i32)))
  (type (;62;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;63;) (func (param i32 i32 f64 i32) (result i32)))
  (type (;64;) (func (param i32 i32 i32 i32 f64 i32 i32)))
  (type (;65;) (func (param i32 i64 i32) (result i32)))
  (type (;66;) (func (param i32) (result i64)))
  (type (;67;) (func (param i32 i64) (result i32)))
  (type (;68;) (func (param i32 i64 i64 i32 i32 i32) (result i32)))
  (type (;69;) (func (param i32 i32) (result f32)))
  (type (;70;) (func (param i32 i32 i32) (result f32)))
  (type (;71;) (func (param i32 i32 i32 f64 i32) (result i32)))
  (type (;72;) (func (param i32 f64 i32) (result i32)))
  (type (;73;) (func (param i32 i32 i32 f64 i32 i32) (result i32)))
  (type (;74;) (func (param i32 i64)))
  (type (;75;) (func (param i32 i64 i32 i32) (result i32)))
  (type (;76;) (func (param i32 i64 i32 i32 i32) (result i32)))
  (type (;77;) (func (param i32 i64) (result i64)))
  (type (;78;) (func (param i32 f64) (result f64)))
  (type (;79;) (func (param i32 f64 f64) (result f64)))
  (type (;80;) (func (param i32 i32 i32 f64 i32)))
  (type (;81;) (func (param i32 i32 i32 f64 f64 i32 i32 i32 i32) (result i32)))
  (type (;82;) (func (param i32 i32) (result i64)))
  (type (;83;) (func (param i32 f64 i32 i32 i32) (result i32)))
  (type (;84;) (func (param i32 i64 i32 i32 i32 i32) (result i32)))
  (type (;85;) (func (param i32) (result f64)))
  (type (;86;) (func (param i32 f64 i32)))
  (type (;87;) (func (param i32 f64)))
  (type (;88;) (func (param i32 f64 i32 i32 i32)))
  (type (;89;) (func (param i32 i64 i32 i32)))
  (type (;90;) (func (param i32 f64 i32 i32)))
  (type (;91;) (func (param f32 i32 i32)))
  (type (;92;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;93;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;94;) (func (param f64 i32 i32) (result f64)))
  (type (;95;) (func (param i64 i32 i32)))
  (type (;96;) (func (param i32 i32 f64 i32 i32)))
  (type (;97;) (func (param f64 i32 i32 i32 i32) (result i32)))
  (type (;98;) (func (param i32 i32 f64 i32 i32 i32)))
  (type (;99;) (func (param f64 i32 i32) (result i32)))
  (type (;100;) (func (param f64 f64 i32 i32) (result i32)))
  (type (;101;) (func (param i32 f64 f64 i32 i32)))
  (type (;102;) (func (param f32 f32 i32 i32 i32 i32 i32)))
  (type (;103;) (func (param i32 f32 f32 i32 i32)))
  (type (;104;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)))
  (type (;105;) (func (param i32 i32 i32 i64 i64 i64 i64 i32 i32 i32)))
  (type (;106;) (func (param f64 i32 i32 i32 i32) (result f64)))
  (type (;107;) (func (param f64 i32 i32 i32 i32 i32) (result i32)))
  (type (;108;) (func (param f64 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;109;) (func (param i32 i32 i32 f64 i32 i32 i32 i32)))
  (type (;110;) (func (param i32 i32 f64 i32 i32 i32 i32)))
  (type (;111;) (func (param i32 i32 f64 i32 i32 i32 i32 i32)))
  (type (;112;) (func (param i32 i32 f64 i32 i32 i32 i32 i32 i32)))
  (type (;113;) (func (param i32 i32 f64 f64 i32 i32 i32 i32)))
  (type (;114;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;115;) (func (param i32 f64 i32 i32 i32 i32 i32 i32)))
  (type (;116;) (func (param i32 i32 i32) (result f64)))
  (type (;117;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i64)))
  (type (;118;) (func (param i32 i32 i32 i32 i32 i32 i32 i32) (result i64)))
````

## Literal token occurrence counts

Raw textual occurrences of each literal token across the entire file. These are
**textual counts, not validated WASM semantics**: `(func` also counts inline
func type uses inside imports/exports, and tokens may also appear inside data
string payloads. Counts were obtained by streaming the file line by line.

| Token | Occurrences |
|---|---:|
| `(func` | 81,447 |
| `(export` | 11 |
| `(import` | 34 |
| `(type` | 133,150 |
| `(memory` | 2 |
| `(table` | 1 |
| `(global` | 5,163 |
| `(elem` | 1 |
| `(data` | 21 |

## Exports — `(export "NAME"` (deduplicated, sorted)

Total unique export names: **11** (listing 11; display cap 2000).

- `_initialize`
- `computer_use_browser_wasm_allocate`
- `computer_use_browser_wasm_deallocate`
- `computer_use_browser_wasm_revision_copy_identity`
- `computer_use_browser_wasm_revision_copy_text`
- `computer_use_browser_wasm_revision_create`
- `computer_use_browser_wasm_revision_identity_length`
- `computer_use_browser_wasm_revision_is_value_settable`
- `computer_use_browser_wasm_revision_release`
- `computer_use_browser_wasm_revision_text_length`
- `memory`

## Imports — `(import "MODULE" "NAME"` (deduplicated, sorted)

Total unique import pairs: **34** (listing 34; display cap 500).

- `(import "wasi_snapshot_preview1" "args_get")`
- `(import "wasi_snapshot_preview1" "args_sizes_get")`
- `(import "wasi_snapshot_preview1" "clock_res_get")`
- `(import "wasi_snapshot_preview1" "clock_time_get")`
- `(import "wasi_snapshot_preview1" "environ_get")`
- `(import "wasi_snapshot_preview1" "environ_sizes_get")`
- `(import "wasi_snapshot_preview1" "fd_close")`
- `(import "wasi_snapshot_preview1" "fd_fdstat_get")`
- `(import "wasi_snapshot_preview1" "fd_fdstat_set_flags")`
- `(import "wasi_snapshot_preview1" "fd_filestat_get")`
- `(import "wasi_snapshot_preview1" "fd_filestat_set_size")`
- `(import "wasi_snapshot_preview1" "fd_filestat_set_times")`
- `(import "wasi_snapshot_preview1" "fd_pread")`
- `(import "wasi_snapshot_preview1" "fd_prestat_dir_name")`
- `(import "wasi_snapshot_preview1" "fd_prestat_get")`
- `(import "wasi_snapshot_preview1" "fd_read")`
- `(import "wasi_snapshot_preview1" "fd_readdir")`
- `(import "wasi_snapshot_preview1" "fd_seek")`
- `(import "wasi_snapshot_preview1" "fd_sync")`
- `(import "wasi_snapshot_preview1" "fd_tell")`
- `(import "wasi_snapshot_preview1" "fd_write")`
- `(import "wasi_snapshot_preview1" "path_create_directory")`
- `(import "wasi_snapshot_preview1" "path_filestat_get")`
- `(import "wasi_snapshot_preview1" "path_filestat_set_times")`
- `(import "wasi_snapshot_preview1" "path_link")`
- `(import "wasi_snapshot_preview1" "path_open")`
- `(import "wasi_snapshot_preview1" "path_readlink")`
- `(import "wasi_snapshot_preview1" "path_remove_directory")`
- `(import "wasi_snapshot_preview1" "path_rename")`
- `(import "wasi_snapshot_preview1" "path_symlink")`
- `(import "wasi_snapshot_preview1" "path_unlink_file")`
- `(import "wasi_snapshot_preview1" "poll_oneoff")`
- `(import "wasi_snapshot_preview1" "proc_exit")`
- `(import "wasi_snapshot_preview1" "random_get")`

## Notes

- The ~202 MB source WAT was **never loaded into memory in full**; it was
  streamed line by line for the counts and lists above.
- Export names and import pairs are deduplicated and lexicographically sorted;
  the display caps (2000 exports / 500 imports) apply only if totals exceed them.
- This is a structural overview only: no runtime behavior, semantic validation,
  or original-source claim is made. The full WAT is the authoritative artifact.

