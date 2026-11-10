/** Build the native worker's environment without starting a launcher process. */
export declare function create_launch_environment({ env, instructions_directory, platform, }: {
    env: NodeJS.ProcessEnv;
    instructions_directory: URL;
    platform: NodeJS.Platform;
}): {
    CUA_REPL_ENABLED_SURFACES: string;
    NODE_REPL_JS_COMPLETION_SUMMARY: string | undefined;
    NODE_REPL_UNTRUSTED_ENV_ALLOWLIST: string;
    NODE_REPL_TRUSTED_SERVICES: string;
    NODE_REPL_JS_BANNER: string;
    NODE_REPL_TOOL_OVERRIDES: string;
    NODE_ENV?: string;
    TZ?: string;
};
