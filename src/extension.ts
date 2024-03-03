import * as vscode from 'vscode';
import {Position, Range} from "vscode";
import {SpawnOptions} from "child_process";
import {JsonTools} from "./tools/JsonTools";
import {StreamReader} from "./StreamReader";
import {ReadLineResponse} from "./data/ReadLineResponse";
import {TimedReader} from "./TimedReader";
import {Constants} from "./Constants";
import {NotificationTools} from "./tools/NotificationTools";
import {Tools} from "./tools/Tools";
import {logDebug} from "./tools/LogTools";
import {spawn} from "node:child_process";
import {OsTools} from "./tools/OsTools";

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
    NotificationTools.notifyInfo('DartFormat is stopping ...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    NotificationTools.notifyInfo('DartFormat is stopped.');
}

async function formatText(unformattedText: string): Promise<string>
{
    return "/* TODO */\n" + unformattedText;
}

async function format(): Promise<void>
{
    if (!isDartFormatProcessRunning)
    {
        NotificationTools.notifyWarning('DartFormat: External dart format process is not running.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        NotificationTools.notifyInfo("Please open a file in order to format it.");
        return;
    }

    NotificationTools.notifyInfo('Formatting ...');

    const document = editor.document;
    const unformattedText = document.getText();
    const formattedText = await formatText(unformattedText);

    await editor.edit((editBuilder) =>
    {
        const startPos = new Position(0, 0);
        const endPos = document.positionAt(unformattedText.length - 1);
        editBuilder.replace(new Range(startPos, endPos), formattedText);
    });

    NotificationTools.notifyInfo('Done formatting.');
}

async function startExternalDartFormatProcess(): Promise<boolean>
{
    const externalDartFormatFilePathOrError = OsTools.getExternalDartFormatFilePathOrError();
    if (externalDartFormatFilePathOrError instanceof Error)
    {
        const title = "Failed to start external dart_format: " + externalDartFormatFilePathOrError.message;
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        NotificationTools.notifyError(title, content, actions);
        return false;
    }

    const args = ["--web", "--errors-as-json", "--log-to-temp-file"];
    const spawnOptions: SpawnOptions = {shell: false, stdio: "pipe"};

    logDebug("Starting external dart_format: " + externalDartFormatFilePathOrError + " " + args.join(" "));
    const process = spawn(externalDartFormatFilePathOrError, args, spawnOptions);

    logDebug("process.exitCode: " + process.exitCode);
    logDebug("process.pid: " + process.pid);
    logDebug("process: " + JsonTools.stringify(process));

    if (!process.pid   || !process.stdout  || !process.stderr )
    {
        const title = "Failed to start external dart_format: ?";
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        NotificationTools.notifyError(title, content, actions);
        return false;
    }

    NotificationTools.notifyInfo("External dart_format process is alive.\nWaiting for connection details ...");

    const processStdOutReader = new StreamReader(process.stdout);
    const processStdErrReader = new StreamReader(process.stderr);
    let readLineResponse: ReadLineResponse | undefined

    while (true)
    {
        readLineResponse = await TimedReader.readLine(process, processStdOutReader, processStdErrReader, Constants.WAIT_FOR_EXTERNAL_DART_FORMAT_START_IN_SECONDS, "connection details from external dart_format")
        if (readLineResponse === undefined)
            break;

        if (readLineResponse.stdErr  )
            break;

        if (readLineResponse.stdOut  )
        {
            if (readLineResponse.stdOut .startsWith("{"))
                break;
            else
                logDebug("Unexpected plain text: " + readLineResponse.stdOut)
        }
    }

    //isDartFormatProcessRunning = true;
    return true;
}

