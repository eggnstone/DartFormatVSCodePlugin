import fs from "fs";
import vscode from "vscode";
import {LinkInfo} from "./LinkInfo";

export function logDebug(s: string): void
{
    Tools.logDebug(s);
}

export class Tools
{
    static debugOutputChannel = vscode.window.createOutputChannel("DartFormat");

    static createCheckInstallationInstructionsLink(): LinkInfo
    {
        return new LinkInfo("Installation instructions for dart_format", "https://pub.dev/packages/dart_format/install");
    }

    static getExternalDartFormatFilePathOrError(): (string | Error)
    {
        logDebug("Tools.getExternalDartFormatFilePathOrError()");

        let externalDartFormatFilePath;

        if (Tools.isWindows())
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

    static logDebug(s: string)
    {
        Tools.debugOutputChannel.appendLine(s);
    }

    static async showError(message: string, content: string, actions: LinkInfo[]): Promise<void>
    {
        const fixedContent = content
            .replace(/\n/g, " ")
            .replace(/<br\/>/g, " ")
            .replace(/<pre>/g, " ")
            .replace(/<\/pre>/g, " ");
        const linkInfoNames: string[] = actions.map((linkInfo: LinkInfo) => linkInfo.name);
        const linkInfoName = await vscode.window.showErrorMessage<string>(message + " " + fixedContent, ...linkInfoNames);
        Tools.showInfo("linkInfoName: " + linkInfoName);
        if (!linkInfoName)
        {
            return;
        }

        const linkInfo = actions.find((linkInfo: LinkInfo) => linkInfo.name === linkInfoName);
        if (linkInfo)
        {
            vscode.env.openExternal(vscode.Uri.parse(linkInfo.url));
        }
    }

    static showInfo(message: string): void
    {
        // noinspection JSIgnoredPromiseFromCall
        vscode.window.showInformationMessage(message);
    }

    static showWarning(message: string): void
    {
        // noinspection JSIgnoredPromiseFromCall
        vscode.window.showWarningMessage(message);
    }
}
