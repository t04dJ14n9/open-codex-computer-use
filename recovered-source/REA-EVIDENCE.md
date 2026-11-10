# REA Evidence index

Session: 2026-11-10, REA 6.7.0 (`server_identity.package.version`), macOS arm64.
All records are `shipped-artifact` authority. The complete canonical bundle is
`.local/rea-evidence-bundle.json` (16 records, 0 unknowns, 130,692,412 bytes);
it is gitignored because the JavaScript application graphs are large.

| Evidence ID | Operation | Subject / digest | What it establishes |
| --- | --- | --- | --- |
| `ev_900441182d0b9c5d93bcbe32cb4a17716b20e0081d650a26eb03aa3ef54293bd` | `inspect_macho` (complete parent) | `SkyComputerUseService` / `469500545c940ecb20541d71a979461ea6bd22e92b513a87fa57eab90cd1061a` | arm64 thin; 90 load commands, 70 dependencies, 4,692 imports, 43,876 exports (non-exhaustive), 5 segments |
| `ev_873dc105135d3482041ea862bd2ea16cb2595b3fde1166399f544e81ca61b8b0` | `inspect_macho` summary view | same | per-collection counts and coverage |
| `ev_c51b0b6da05020ac8d4718404efb1270f55e0b76fa1cc16b50d0b9b20eb973b8` | `inspect_signature` | same | `com.openai.sky.CUAService`, team `2DC432GLL2`, hardened runtime, entitlements, Developer ID cert chain, 3 Nov 2026 |
| `ev_79f9c5b9c775ec93cc8d5acbf08c66dd01133c4ed2a8764f7a82f27855b81f14` | `inspect_plist` | `Contents/Info.plist` | version `26.1102.1001824`, macOS 26.1 SDK, min macOS 14.4, Sparkle feed |
| `ev_874ed2261ad9279096e77bd074ea73138674d5c32c50b8e644cedebfd2510393` | `inspect_native_dispatch_metadata` (300) | same | decoded ObjC/XPC protocols (`SAIComputerUseIPCXPCProtocol`, `SAILockScreenGuardianXPCProtocol`, `SAIRemoteHostedPIPContentHostXPCProtocol`, …); partial coverage |
| `ev_b4429454a8a74f2d8958b9e4fb2f38ac626dc74c0f2b7d3777cc3862b614711f` | `analyze_javascript_application` (complete parent) | `@oai` / `b9b00ad541eeccea8ffb346aff27abea4d542db7702482ad135998cc411cc22c` | 13 selected JS entries, 47,685 AST nodes, 76 findings; 788 files outside scope; partial coverage |
| `ev_10ba0c2b9961aad79acf9a404f61bd08d592feb691f3f83231fa269fbe06a405` | JS graph summary view | same | statistics, coverage, unknowns |
| `ev_c6c25ae8c333cb6e69c2f53b5f9346d146ee35e6e5913d0cff500085ef8de96a` | JS graph module page (0–32) | same | module identities/node IDs |
| `ev_bcd4c4ebf782e83ba6517e5598878cdcbf436a228854e0df0a3ea2ff05919aee` | `trace_application_feature` (`get_app_state`) | same | retained only; full response exceeded MCP transport budget; preserved in exported bundle |
| `ev_65bfffccc50fdb82d6774ac89d511d0bc97f54588f07ea75c60bae61ad295533` | `analyze_javascript_application` (complete parent) | `node-repl-embedded` / `1fd059015ecdb9704b49553e6a54691bc7bdb6d422e464e8cf5859f71da3aedd` | 8 JS files, 14,693 AST nodes, 93 findings; partial coverage |
| `ev_ad5a666390b730d7add764541f4737bd0ad99e042134a47d1d561cd004f2f721` | JS graph summary view | same | statistics, coverage, unknowns |
| `ev_7c1200d29e069eb09471a05270a9fb826338c1743fad5750d0ad6f7f798d680f` | `analyze_javascript_application` (complete parent) | `readable-browser/embedded` / `1f2fe7d5755712a24c96285c014e7843a79816f657592971533ad5701bff56fb` | 7 decoded chunks, 45,669 AST nodes, 16 findings, 1 parse failure; partial coverage |
| `ev_5b32f6be4329d321762fcfa160cfcc3d077ac7356f314f46cdd6013bdf48f19f` | JS graph summary view | same | statistics, coverage, unknowns |
| `ev_8d7337700494ae410ba7562be5c2eecb14e3e7b488f32177ad3f7aa19f920d12` | `inspect_artifact` (complete parent) | `shipped-computer-use-plugin.zip` / `3a6ccb633f4aec2cdd422ee0a50e6dece864b8faee1dcc1432b5ab7cff8c59dc` | 8 nodes, 8 occurrences, 7 edges, 4 files + 4 directories, inventory coverage `complete` within `container-entries`, 0 integrity contradictions |
| `ev_b25f3429efb255ba54ebd8d6cbe858ecc5b7b41d3097aff020bedb7780ce8a7d` | artifact inventory Evidence | same | nested typed inventory |
| `ev_62e11feed242252827873b3e719c66f1894e6dc9548a963e8ad5f7047a11a150` | `inspect_artifact` summary view | same | manifest, counts, coverage |

## Earlier (October 2026) records, context only

- `ev_6bf4ad38748e942470dd3b1291d9d909d4b4b2c9b40c2098de2fc29b608cabc3` — service Mach-O identity/layout (older build `e798d6a2…`).
- `ev_c273ddb9e0720fc839e2fb23d4e9e13ede659e16c48554898fb127f9911b8810` — 400-record dispatch metadata.
- `ev_3a1c921fede34d813d260e2121dab79b9062ce414cb812f04e9d60a5f3ff0f87` — service signature/entitlements.

## Known gaps

- Hopper (`binary_overview`, `get_objc_classes`, pseudocode) was blocked by a
  macOS Automation permission denial (`provider_unavailable`). No native
  pseudocode exists; exact Swift/Rust source is unavailable.
- Each JavaScript application graph has `partial` coverage with explicit
  semantic unknowns; static graphs never prove runtime execution.
- `inspect_macho` imports/exports are explicitly non-exhaustive.
