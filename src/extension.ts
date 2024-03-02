import * as vscode from 'vscode';
import {Position, Range} from "vscode";
import {logDebug, Tools} from "./tools/Tools";
import {ChildProcess, spawn} from "node:child_process";
import {SpawnOptions} from "child_process";
import {JsonTools} from "./tools/JsonTools";

let isDartFormatProcessRunning = false;

// noinspection JSUnusedGlobalSymbols
export async function activate(context: vscode.ExtensionContext): Promise<void>
{
    const disposable = vscode.commands.registerCommand('DartFormat.format', format);
    context.subscriptions.push(disposable);

    await startExternalDartFormatProcess();
}

// noinspection JSUnusedGlobalSymbols
export async function deactivate(): Promise<void>
{
    Tools.showInfo('DartFormat is stopping ...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    Tools.showInfo('DartFormat is stopped.');
}

async function formatText(unformattedText: string): Promise<string>
{
    return "/* TODO */\n" + unformattedText;
}

async function format(): Promise<void>
{
    if (!isDartFormatProcessRunning)
    {
        Tools.showWarning('DartFormat: External dart format process is not running.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        Tools.showInfo("Please open a file in order to format it.");
        return;
    }

    Tools.showInfo('Formatting ...');

    const document = editor.document;
    const unformattedText = document.getText();
    const formattedText = await formatText(unformattedText);

    await editor.edit((editBuilder) =>
    {
        const startPos = new Position(0, 0);
        const endPos = document.positionAt(unformattedText.length - 1);
        editBuilder.replace(new Range(startPos, endPos), formattedText);
    });

    Tools.showInfo('Done formatting.');
}

async function startExternalDartFormatProcess(): Promise<boolean>
{
    const externalDartFormatFilePathOrError = Tools.getExternalDartFormatFilePathOrError();
    if (externalDartFormatFilePathOrError instanceof Error)
    {
        const title = "Failed to start external dart_format: " + externalDartFormatFilePathOrError.message;
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [Tools.createCheckInstallationInstructionsLink()];
        Tools.showError(title, content, actions);
        return false;
    }

    const args = ["--web", "--errors-as-json", "--log-to-temp-file"];
    const spawnOptions: SpawnOptions = {shell: false, stdio: "pipe"};

    logDebug("Starting external dart_format: " + externalDartFormatFilePathOrError + " " + args.join(" "));
    const process = spawn(externalDartFormatFilePathOrError + "x", args, spawnOptions);

    logDebug("process.exitCode: " + process.exitCode);
    logDebug("process.pid: " + process.pid);
    logDebug("process: " + JsonTools.stringify(process));

    if (process.pid === undefined)
    {
        const title = "Failed to start external dart_format: ?";
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [Tools.createCheckInstallationInstructionsLink()];
        Tools.showError(title, content, actions);
        return false;
    }

    /*

     */
    //isDartFormatProcessRunning = true;
    return true;
}

