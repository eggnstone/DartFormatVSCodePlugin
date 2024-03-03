import * as vscode from 'vscode';
import {Position, Range} from "vscode";
import {SpawnOptions} from "child_process";
import {StreamReader} from "./StreamReader";
import {ReadLineResponse} from "./data/ReadLineResponse";
import {TimedReader} from "./TimedReader";
import {Constants} from "./Constants";
import {NotificationTools} from "./tools/NotificationTools";
import {logDebug} from "./tools/LogTools";
import {spawn} from "node:child_process";
import {OsTools} from "./tools/OsTools";
import {Process} from "./Process";
import {JsonTools} from "./tools/JsonTools";
import {Version} from "./data/Version";
import {DartFormatClient} from "./DartFormatClient";
import {DartFormatError} from "./data/DartFormatException";

let dartFormatClient: DartFormatClient | undefined;

// noinspection JSUnusedGlobalSymbols
export async function activate(context: vscode.ExtensionContext): Promise<void>
{
    const disposable = vscode.commands.registerCommand('DartFormat.format', format);
    context.subscriptions.push(disposable);

    dartFormatClient = await startExternalDartFormatProcess();
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
    if (!dartFormatClient)
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

async function startExternalDartFormatProcess(): Promise<DartFormatClient | undefined>
{
    const externalDartFormatFilePathOrError = OsTools.getExternalDartFormatFilePathOrError();
    if (externalDartFormatFilePathOrError instanceof Error)
    {
        const title = "Failed to start external dart_format: " + externalDartFormatFilePathOrError.message;
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        NotificationTools.notifyError(title, content, actions);
        return undefined;
    }

    const args = ["--web", "--errors-as-json", "--log-to-temp-file"];
    const spawnOptions: SpawnOptions = {shell: false /*, stdio: [Stdin, Stdout, Stderr]*/};
    logDebug("Starting external dart_format: " + externalDartFormatFilePathOrError + " " + args.join(" "));
    const process = new Process(spawn(externalDartFormatFilePathOrError, args, spawnOptions));

    if (!process.isAlive())
    {
        const title = "Failed to start external dart_format: ?";
        const content = "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        NotificationTools.notifyError(title, content, actions);
        return undefined;
    }

    NotificationTools.notifyInfo("External dart_format process is alive.\nWaiting for connection details ...");

    const processStdOutReader = new StreamReader(process.stdOut, "stdout");
    const processStdErrReader = new StreamReader(process.stdErr, "stderr");
    let readLineResponse: ReadLineResponse | undefined;

    while (true)
    {
        readLineResponse = await TimedReader.readLine(process, processStdOutReader, processStdErrReader, Constants.WAIT_FOR_EXTERNAL_DART_FORMAT_START_IN_SECONDS, "connection details from external dart_format");
        if (readLineResponse === undefined)
        {
            break;
        }

        if (readLineResponse.stdErr)
        {
            break;
        }

        if (readLineResponse.stdOut)
        {
            if (readLineResponse.stdOut.startsWith("{"))
            {
                break;
            }
            else
            {
                logDebug("Unexpected plain text: " + readLineResponse.stdOut);
            }
        }
    }

    if (readLineResponse === undefined)
    {
        return undefined;
    }

    const jsonEncodedResponse = readLineResponse.stdOut ?? readLineResponse.stdErr ?? "<no response>";
    const jsonResponse = JsonTools.parseOrUndefined(jsonEncodedResponse);

    if (jsonResponse === undefined)
    {
        const title = "External dart_format: Expected connection details in JSON but received plain text.";

        let content = "";
        if (readLineResponse.stdOut)
        {
            content += "\nStdOut: ${readLineResponse.stdOut}";
        }
        content += TimedReader.receiveLines(processStdOutReader, "stdout", "\nStdOut: ") ?? "";
        if (readLineResponse.stdErr)
        {
            content += "\nStdErr: ${readLineResponse.stdErr}";
        }
        content += TimedReader.receiveLines(processStdErrReader, "stderr", "\nStdErr: ") ?? "";
        content = content.trim();

        if (content)
        {
            content += "\n";
        }

        content += "Did you install the dart_format package?\n" +
            "Basically just execute this:<pre>dart pub global activate dart_format</pre>";

        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        // TODO: add report link?
        NotificationTools.notifyError(title, content, actions);
        return undefined;
    }

    const baseUrl = JsonTools.getString(jsonResponse, "Message", "");
    const currentVersion = Version.parseOrUndefined(JsonTools.getString(jsonResponse, "CurrentVersion", ""));
    const latestVersion = Version.parseOrUndefined(JsonTools.getString(jsonResponse, "LatestVersion", ""));
    logDebug(`$methodName: baseUrl:        ${baseUrl}`);
    logDebug(`$methodName: currentVersion: ${currentVersion}`);
    logDebug(`$methodName: latestVersion:  ${latestVersion}`);

    const dartFormatClient = new DartFormatClient(baseUrl);
    const httpResponse = await dartFormatClient.get("/status");
    if (httpResponse.status !== 200)
    {
        throw DartFormatError.localError("External dart_format: Requested status but got: " + httpResponse.status + " " + httpResponse.body);
    }

    NotificationTools.notifyInfo("External dart_format is ready." + JsonTools.stringify(jsonResponse));

    if (currentVersion?.isOlderThan(latestVersion))
    {
        const title = "A new version of the dart_format package is available.";
        const content = "<pre>Current version: " + currentVersion + "\nLatest version:  " + latestVersion + "</pre>" +
            "Just execute this again:<pre>dart pub global activate dart_format</pre>";
        const actions = [NotificationTools.createCheckInstallationInstructionsLink()];
        NotificationTools.notifyInfo(title, content, actions);
    }

    /*
    while (true)
    {
        const formatJob = channel.receive()
        Logger.logDebug("$methodName: Got new job: ${formatJob.command}")
        lastVirtualFile =  formatJob.virtualFile

        if (!process.isAlive)
        {
            // TODO: fix
            if (!alreadyNotifiedAboutExternalDartFormatProcessDeath)
            {
                alreadyNotifiedAboutExternalDartFormatProcessDeath = true
                const title = "External dart_format process died."
                const reportErrorLink = NotificationTools.createReportErrorLink(
                    content = null,
                    gitHubRepo = Constants.REPO_NAME_DART_FORMAT_JET_BRAINS_PLUGIN,
                    origin = null,
                    stackTrace = null,
                    title = title
                )
                NotificationTools.notifyError(NotificationInfo(
                    content = null,
                    listOf(reportErrorLink),
                    origin = null,
                    project = null,
                    title = title,
                    virtualFile = null
                ))
            }
        }

        if (formatJob.command.toLowerCasePreservingASCIIRules() == "format")
        {
            Logger.logDebug("Calling format()")
            formatJob.formatResult = formatViaExternalDartFormat(config = formatJob.config, inputText = formatJob.inputText!!)
            Logger.logDebug("Called format()")
            Logger.logDebug("Calling formatJob.complete() 1")
            formatJob.complete()
            Logger.logDebug("Called formatJob.complete() 1")
            continue
        }

        if (formatJob.command.toLowerCasePreservingASCIIRules() == "quit")
        {
            Logger.logDebug("Calling quit()")
            formatJob.formatResult = quitExternalDartFormat()
            Logger.logDebug("Called quit()")
            Logger.logDebug("Calling formatJob.complete() 2")
            formatJob.complete()
            Logger.logDebug("Called formatJob.complete() 2")
            break
        }

        formatJob.formatResult = FormatResult.error("Unknown command: ${formatJob.command}")
        formatJob.complete()
    }

    Logger.logDebug(methodName+": END")
*/

    return dartFormatClient;
}

