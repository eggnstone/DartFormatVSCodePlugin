import {PathOrError} from "../data/PathOrError";
import {logDebug} from "./LogTools";
import fs from "fs";
import {OsTools} from "./OsTools";

export class ExternalDartFormatTools
{
    static getExternalDartFormatFilePathOrError(): PathOrError
    {
        logDebug("Tools.getExternalDartFormatFilePathOrError()");

        let externalDartFormatFilePath;

        if (OsTools.instance.isWindows)
        {
            if (OsTools.instance.envPubCache)
            {
                externalDartFormatFilePath = OsTools.instance.envPubCache;
            }
            else
            {
                if (!OsTools.instance.envLocalAppData)
                {
                    return PathOrError.error(
                        "Cannot find the dart_format package:" +
                        " Neither PUB_CACHE or LOCALAPPDATA environment variable are set."
                    );
                }

                externalDartFormatFilePath = OsTools.instance.envLocalAppData + "\\Pub\\Cache";
            }

            externalDartFormatFilePath = externalDartFormatFilePath + "\\bin\\dart_format.bat";
        }
        else
        {
            if (!OsTools.instance.envShell)
                return PathOrError.error("Cannot execute dart_format: SHELL environment variable is not set.");

            if (!OsTools.instance.envHome)
                return PathOrError.error("Cannot execute dart_format: HOME environment variable is not set.");

            externalDartFormatFilePath = OsTools.instance.envHome + "/.pub-cache/bin/dart_format";
        }

        if (!fs.existsSync(externalDartFormatFilePath))
        {
            return PathOrError.error(
                "Cannot find the dart_format package:" +
                " File does not exist at expected location:" +
                " " + externalDartFormatFilePath
            );
        }

        logDebug(`  Found: ${externalDartFormatFilePath}`);
        return PathOrError.path(externalDartFormatFilePath);
    }

    static getDartPathOrError(): PathOrError
    {
        if (OsTools.instance.isWindows)
            return PathOrError.path("dart.bat");

        if (!OsTools.instance.envShell)
            return PathOrError.error("Cannot execute dart: SHELL environment variable is not set.");

        return PathOrError.path("dart");
    }
}
