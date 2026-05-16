import {logDebug} from "./LogTools";

export class OsTools
{
    static readonly instance = new OsTools();

    readonly envHome?: string;
    readonly envLocalAppData?: string;
    readonly envPubCache?: string;
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
        }
        else
        {
            this.envHome = process.env["HOME"];
            logDebug("  \$HOME:          " + this.envHome);

            this.envLocalAppData = undefined;
            this.envPubCache = undefined;
        }
    }
}
