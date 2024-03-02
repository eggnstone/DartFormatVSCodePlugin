import * as vscode from 'vscode';
import {Position, Range} from "vscode";

// noinspection JSUnusedGlobalSymbols
export function activate(context: vscode.ExtensionContext)
{
    showInfo('DartFormat is starting ...');
    const disposable = vscode.commands.registerCommand('DartFormat.format', format);
    context.subscriptions.push(disposable);
}

// noinspection JSUnusedGlobalSymbols
export async function deactivate(): Promise<void>
{
    showInfo('DartFormat is stopping ...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    showInfo('DartFormat is stopped.');
}

async function formatText(unformattedText: string)
{
    return "/* TODO */\n" + unformattedText;
}

export async function format(): Promise<void>
{
    const editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        showInfo("Please open a file in order to format it.");
        return;
    }

    showInfo('Formatting ...');

    const document = editor.document;
    const unformattedText = document.getText();
    const formattedText = await formatText(unformattedText);

    await editor.edit((editBuilder) =>
    {
        const startPos = new Position(0, 0);
        const endPos = document.positionAt(unformattedText.length - 1);
        editBuilder.replace(new Range(startPos, endPos), formattedText);
    });

    showInfo('Done formatting.');
}

function showInfo(message: string)
{
    // noinspection JSIgnoredPromiseFromCall
    vscode.window.showInformationMessage(message);
}
