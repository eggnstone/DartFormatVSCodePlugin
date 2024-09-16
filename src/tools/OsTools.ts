import {logDebug} from "./LogTools";

export class OsTools
{
    static readonly instance = new OsTools();

    readonly envHome?: string;
    readonly envLocalAppData?: string;
    readonly envPubCache?: string;
    readonly envShell: string;
    readonly envShellParam: string;
    readonly isWindows: boolean;

    constructor()
    {
        logDebug("OsTools()");

        this.isWindows = process.platform === "win32";
        logDebug("  IsWindows:      " + this.isWindows + " (" + process.platform + ")");

        //logDebug("  TempDir:        " + this.getTempDirName())

        if (this.isWindows)
        {
            this.envLocalAppData = process.env["LOCALAPPDATA"];
            logDebug("  %LOCALAPPDATA%: " + this.envLocalAppData);

            this.envPubCache = process.env["PUB_CACHE"];
            logDebug("  %PUB_CACHE%:    " + this.envPubCache);

            this.envHome = undefined;
            this.envShell = "cmd";
            this.envShellParam = "/c";
        }
        else
        {
            this.envHome = process.env["HOME"];
            logDebug("  \$HOME:          " + this.envHome);

            this.envShell = process.env["SHELL"] || "";
            logDebug("  \$SHELL:         " + this.envShell);

            this.envLocalAppData = undefined;
            this.envPubCache = undefined;
            this.envShellParam = "-c";
        }
    }
}
