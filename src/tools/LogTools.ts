import vscode from "vscode";

export function logDebug(s: string): void
{
    LogTools.logDebug(s);
}

export function logError(s: string): void
{
    LogTools.logError(s);
}

export class LogTools
{
    static debugOutputChannel = vscode.window.createOutputChannel("DartFormat");

    static logDebug(s: string): void
    {
        LogTools.debugOutputChannel.appendLine(s);
    }

    static logError(s: string): void
    {
        LogTools.debugOutputChannel.appendLine("ERROR: " + s);
    }
}
