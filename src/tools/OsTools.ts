import fs from "fs";
import {logDebug} from "./LogTools";

export class OsTools
{
    static getExternalDartFormatFilePathOrError(): (string | Error)
    {
        logDebug("Tools.getExternalDartFormatFilePathOrError()");

        let externalDartFormatFilePath;

        if (OsTools.isWindows())
        {
            logDebug("  IsWindows: true (" + process.platform + ")");

            const envPubCache = process.env["PUB_CACHE"];
            logDebug(`  %PUB_CACHE%:    ${envPubCache}`);
            const envLocalAppData = process.env["LOCALAPPDATA"];
            logDebug(`  %LOCALAPPDATA%: ${envLocalAppData}`);

            if (envPubCache)
            {
                externalDartFormatFilePath = envPubCache;
            }
            else
            {
                if (!envLocalAppData)
                {
                    return new Error(
                        "Cannot find the dart_format package:" +
                        " Neither PUB_CACHE or LOCALAPPDATA environment variable are set."
                    );
                }

                externalDartFormatFilePath = `${envLocalAppData}\\Pub\\Cache`;
            }

            externalDartFormatFilePath = `${externalDartFormatFilePath}\\bin\\dart_format.bat`;
        }
        else
        {
            logDebug("  IsWindows: false (" + process.platform + ")");
            externalDartFormatFilePath = "~/.pub-cache/bin/dart_format.sh";
        }

        logDebug(`  externalDartFormatFilePath: ${externalDartFormatFilePath}`);
        if (!fs.existsSync(externalDartFormatFilePath))
        {
            return new Error(
                "Cannot find the dart_format package:" +
                " File does not exist at expected location:" +
                " " + externalDartFormatFilePath
            );
        }

        return externalDartFormatFilePath;
    }

    static isWindows(): boolean
    {
        return process.platform === "win32";
    }
}
