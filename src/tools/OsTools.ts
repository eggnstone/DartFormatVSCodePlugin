import {logDebug} from "./LogTools";

export class OsTools
{
    static readonly instance = new OsTools();

    readonly envHome?: string;
    readonly envLocalAppData?: string;
    readonly envPubCache?: string;
    // Unix only: the user's interactive shell, used as `$SHELL -ilc "<cmd>"` so
    // dart_format and `dart pub global activate` see the full interactive PATH
    // (modern macOS / zsh setups keep dart/flutter PATH additions in .zshrc,
    // which a non-interactive shell wouldn't load). Empty on Windows.
    readonly envShell: string;
    readonly isWindows: boolean;

    constructor()
    {
        logDebug("OsTools()");

        this.isWindows = process.platform === "win32";
        logDebug("  IsWindows:      " + this.isWindows + " (" + process.platform + ")");

        if (this.isWindows)
        {
            this.envLocalAppData = process.env["LOCALAPPDATA"];
            logDebug("  %LOCALAPPDATA%: " + this.envLocalAppData);

            this.envPubCache = process.env["PUB_CACHE"];
            logDebug("  %PUB_CACHE%:    " + this.envPubCache);

            this.envHome = undefined;
            this.envShell = "";
        }
        else
        {
            this.envHome = process.env["HOME"];
            logDebug("  \$HOME:          " + this.envHome);

            this.envPubCache = process.env["PUB_CACHE"];
            logDebug("  \$PUB_CACHE:     " + this.envPubCache);

            this.envShell = process.env["SHELL"] ?? "";
            logDebug("  \$SHELL:         " + this.envShell);

            this.envLocalAppData = undefined;
        }
    }
}
