import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext)
{
    //console.log('Congratulations, your extension "DartFormat" is now active!');

    let disposable = vscode.commands.registerCommand('DartFormat.format', () =>
    {
        // noinspection JSIgnoredPromiseFromCall
        vscode.window.showInformationMessage('Hello World from DartFormat!<br/>' +
            'Coming soon to format your Dart files :)');
    });

    context.subscriptions.push(disposable);
}

export function deactivate()
{
}
