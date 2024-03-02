import * as vscode from 'vscode';
import {Position, Range} from "vscode";
import {Tools} from "./Tools";

let isDartFormatProcessRunning = false;

// noinspection JSUnusedGlobalSymbols
export async function activate(context: vscode.ExtensionContext): Promise<void>
{
    Tools.showInfo('DartFormat is starting ...');

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
    Tools.showInfo(`externalDartFormatFilePathOrError: ${externalDartFormatFilePathOrError}`);
    if (externalDartFormatFilePathOrError instanceof Error)
    {
        const title = "Failed to find external dart_format: " + externalDartFormatFilePathOrError.message;
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [Tools.createCheckInstallationInstructionsLink()];
        await Tools.showError(title, content, actions);
        return false;
    }

    //isDartFormatProcessRunning = true;
    return true;
}

