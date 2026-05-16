import * as vscode from 'vscode';
import {Position, Range} from 'vscode';
import {StreamReader} from "./StreamReader";
import {ReadLineResponse} from "./data/ReadLineResponse";
import {TimedReader} from "./TimedReader";
import {Constants} from "./Constants";
import {NotificationTools} from "./tools/NotificationTools";
import {logDebug, logError} from "./tools/LogTools";
import {Process} from "./data/Process";
import {JsonTools} from "./tools/JsonTools";
import {Version} from "./data/Version";
import {DartFormatClient} from "./DartFormatClient";
import {DartFormatError} from "./data/DartFormatException";
import {FormData} from "./data/FormData";
import {FailType} from "./enums/FailType";
import {Config} from "./data/Config";
import {ActionInfo} from "./data/ActionInfo";
import {DartFormatInstaller} from "./tools/DartFormatInstaller";
import {ExternalDartFormatTools} from "./tools/ExternalDartFormatTools";
import {ProcessTools} from "./tools/ProcessTools";

let externalDartFormatProcess: Process | undefined;
let dartFormatClient: DartFormatClient | undefined;
let isFormatting = false;

export async function activate(context: vscode.ExtensionContext): Promise<void>
{
    if (Constants.DEBUG_STARTUP)
    {
        logDebug("activate START");
        await getConfigOrWarn();
    }

    const disposable = vscode.commands.registerCommand('DartFormat.format', format);
    context.subscriptions.push(disposable);

    const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(
        {language: "dart"},
        {provideDocumentFormattingEdits: provideDartFormattingEdits}
    );
    context.subscriptions.push(formattingProvider);

    try
    {
        await startExternalDartFormatProcess();
    }
    catch (e)
    {
        logError(`startExternalDartFormatProcess: ${e}`);
        NotificationTools.notifyError(`Could not start external dart_format: ${e}`);
    }

    if (Constants.DEBUG_STARTUP) logDebug("activate END");
}

export async function deactivate(): Promise<void>
{
    // Best-effort: ask dart_format to shut down so it doesn't outlive the
    // extension host. Failure is fine — the process is going away anyway.
    if (dartFormatClient)
    {
        try { await dartFormatClient.get("/quit"); }
        catch { /* ignore */ }
    }
}

async function formatText(unformattedText: string, config: Config, signal?: AbortSignal): Promise<string | undefined>
{
    if (!dartFormatClient)
        return undefined;

    // Pre-check the size so the user gets a clear message before the
    // server rejects the POST with 413. The 1 KiB margin covers the
    // Config JSON and the multipart boundaries.
    const textBytes = Buffer.byteLength(unformattedText, "utf8");
    if (textBytes > Constants.MAX_REQUEST_BODY_SIZE_IN_BYTES - 1024)
    {
        const limitInMiB = (Constants.MAX_REQUEST_BODY_SIZE_IN_BYTES / (1024 * 1024)).toFixed(0);
        const sizeInMiB = (textBytes / (1024 * 1024)).toFixed(2);
        NotificationTools.notifyError(
            "DartFormat: File too large to format.",
            `dart_format limits the request size to ${limitInMiB} MiB. This file is ${sizeInMiB} MiB.`
        );
        return undefined;
    }

    if (Constants.DEBUG_FAKE_FORMAT_DELAY)
    {
        logDebug("DEBUG_FAKE_FORMAT_DELAY active; sleeping ~5s before formatting (use Cancel to test).");
        const wasAborted = await new Promise<boolean>(resolve =>
        {
            const t = setTimeout(() => resolve(false), 5000);
            signal?.addEventListener("abort", () =>
            {
                clearTimeout(t);
                resolve(true);
            }, {once: true});
        });
        if (wasAborted)
            return undefined;
    }

    const formData = new FormData();
    formData.append("Config", config.toJsonString());
    formData.append("Text", unformattedText);

    let response: Response;
    try
    {
        response = await dartFormatClient.post("/format", formData, signal);
    }
    catch (e)
    {
        if (signal?.aborted)
            return undefined;
        const err = e as Error;
        logError(`formatText: fetch failed: ${err}`);
        NotificationTools.notifyError("dart_format request failed", err.message);
        return undefined;
    }

    if (!response.body)
    {
        logError('  response.body is undefined.');
        return undefined;
    }

    const dartFormatResult = response.headers.get("x-dartformat-result");
    if (dartFormatResult !== "OK")
    {
        const exceptionJsonString = response.headers.get("x-dartformat-exception");
        if (exceptionJsonString)
        {
            try
            {
                const dartFormatError = DartFormatError.fromJson(JSON.parse(exceptionJsonString));

                let title = "Formatting failed";
                const message = dartFormatError.message;
                title += (dartFormatError.line !== undefined && dartFormatError.column !== undefined)
                    ? ` at ${dartFormatError.line}:${dartFormatError.column}.`
                    : ".";

                if (dartFormatError.type === FailType.Warning)
                    NotificationTools.notifyWarning(title, message);
                else
                    NotificationTools.notifyError(title, message);

                return undefined;
            }
            catch (e)
            {
                logError(`Could not parse X-DartFormat-Exception header: ${e}`);
            }
        }

        const bodyText = await response.text();
        const title = `dart_format request failed (HTTP ${response.status}).`;
        const message = bodyText || response.statusText || "No additional details.";
        NotificationTools.notifyError(title, message);

        return undefined;
    }

    const formattedText = await response.text();
    //logDebug("  formattedText: " + StringTools.toDisplayString(formattedText, 100));

    return formattedText;
}

async function getConfigOrWarn(): Promise<Config | undefined>
{
    const config = Config.parse(vscode.workspace.getConfiguration("dartFormat"));
    if (config && !config.hasNothingEnabled())
        return config;

    const action = new ActionInfo("Open settings", () => vscode.commands.executeCommand('workbench.action.openSettings', '@ext:eggnstone.DartFormat'));
    NotificationTools.notifyWarning("DartFormat: No formatting options set.", "", [action]);
    return undefined;
}

async function format(): Promise<void>
{
    if (isFormatting)
    {
        NotificationTools.notifyInfo("DartFormat: Already formatting. Please wait ...");
        return;
    }

    isFormatting = true;
    try
    {
        await formatGuarded();
    }
    finally
    {
        isFormatting = false;
    }
}

async function formatGuarded(): Promise<void>
{
    if (!externalDartFormatProcess || !externalDartFormatProcess.isAlive())
    {
        NotificationTools.notifyWarning('DartFormat: External dart format process is not running.');
        return;
    }

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

    const config = await getConfigOrWarn();
    if (!config)
        return;

    const document = editor.document;
    const unformattedText = document.getText();

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "DartFormat: Formatting ...",
            cancellable: true
        },
        async (_progress, token) =>
        {
            const controller = new AbortController();
            const cancelSub = token.onCancellationRequested(() => controller.abort());
            try
            {
                const startTime = Date.now();
                const formattedText = await formatText(unformattedText, config, controller.signal);
                const diffTime = Date.now() - startTime;
                const diffTimeText = (diffTime < 1000) ? `${diffTime} ms` : `${diffTime / 1000.0} s`;
                logDebug("formatText took " + diffTimeText);

                if (formattedText === undefined)
                    return;

                await editor.edit((editBuilder) =>
                {
                    const startPos = new Position(0, 0);
                    const endPos = document.positionAt(unformattedText.length);
                    editBuilder.replace(new Range(startPos, endPos), formattedText);
                });

                const title = `Formatting took ${diffTimeText}.`;
                const content = formattedText === unformattedText ? "Nothing changed." : "";
                NotificationTools.notifyInfo(title, content);
            }
            finally
            {
                cancelSub.dispose();
            }
        }
    );
}

// Silent variant for VSCode's "Format Document" / format-on-save flow.
// Skips status notifications (the user didn't ask via our command) but still
// surfaces server-side errors through formatText. Honours the cancellation
// token VSCode passes in.
async function provideDartFormattingEdits(
    document: vscode.TextDocument,
    _options: vscode.FormattingOptions,
    token: vscode.CancellationToken
): Promise<vscode.TextEdit[] | undefined>
{
    if (!externalDartFormatProcess || !externalDartFormatProcess.isAlive())
        return undefined;

    if (!dartFormatClient)
        return undefined;

    const config = Config.parse(vscode.workspace.getConfiguration("dartFormat"));
    if (!config || config.hasNothingEnabled())
        return undefined;

    const unformattedText = document.getText();

    const controller = new AbortController();
    const cancelSub = token.onCancellationRequested(() => controller.abort());
    let formattedText: string | undefined;
    try
    {
        formattedText = await formatText(unformattedText, config, controller.signal);
    }
    finally
    {
        cancelSub.dispose();
    }

    if (formattedText === undefined)
        return undefined;

    if (formattedText === unformattedText)
        return [];

    const fullRange = new Range(new Position(0, 0), document.positionAt(unformattedText.length));
    return [vscode.TextEdit.replace(fullRange, formattedText)];
}

async function startExternalDartFormatProcess(): Promise<boolean>
{
    // One auto-attempt for each of: first-install, stale-snapshot recovery, version update.
    // Each loop iteration spawns dart_format from scratch. The flags below stop us from
    // looping forever if an install/update simply fails to produce a working binary.
    let autoInstallAttempted = false;
    let autoRecoveryAttempted = false;
    let autoUpdateAttempted = false;

    while (true)
    {
        const externalDartFormatFilePathOrError = ExternalDartFormatTools.getExternalDartFormatFilePathOrError();
        if (externalDartFormatFilePathOrError.error)
        {
            if (autoInstallAttempted)
            {
                _notifyInstallFailed(externalDartFormatFilePathOrError.error.message);
                return false;
            }

            autoInstallAttempted = true;
            if (!await DartFormatInstaller.tryInstall(false))
                return false;
            continue;
        }

        externalDartFormatProcess = ProcessTools.spawn(
            externalDartFormatFilePathOrError.path!,
            ["--web", "--errors-as-json", "--log-to-temp-file=true"]
        );

        if (!externalDartFormatProcess.isAlive())
        {
            _notifyInstallFailed("Could not start external dart_format process.");
            return false;
        }

        const processStdOutReader = new StreamReader(externalDartFormatProcess.stdOut, "stdout");
        const processStdErrReader = new StreamReader(externalDartFormatProcess.stdErr, "stderr");
        let readLineResponse: ReadLineResponse | undefined;

        if (Constants.DEBUG_FAKE_KERNEL_MISMATCH && !autoRecoveryAttempted)
        {
            logDebug("DEBUG_FAKE_KERNEL_MISMATCH active; killing dart_format and injecting fake stderr.");
            externalDartFormatProcess.kill();
            readLineResponse = new ReadLineResponse(undefined, "Invalid kernel binary format version");
        }
        else
        {
            NotificationTools.notifyInfo("External dart_format process is alive.\nWaiting for connection details ...");

            while (true)
            {
                readLineResponse = await TimedReader.readLine(
                    externalDartFormatProcess,
                    processStdOutReader,
                    processStdErrReader,
                    Constants.WAIT_FOR_EXTERNAL_DART_FORMAT_START_IN_SECONDS,
                    "connection details from external dart_format",
                    false
                );
                if (readLineResponse === undefined)
                    break;

                if (readLineResponse.stdErr)
                    break;

                if (readLineResponse.stdOut)
                {
                    if (readLineResponse.stdOut.startsWith("{"))
                        break;

                    logDebug("Unexpected plain text: " + readLineResponse.stdOut);
                }
            }
        }

        if (readLineResponse === undefined)
            return false;

        // Detect stale snapshot (Dart SDK changed since `pub global activate`):
        // dart prints "Invalid kernel binary format version" or "Invalid SDK hash"
        // on stderr instead of the JSON line. Re-activate once, then retry.
        const stdErrLower = (readLineResponse.stdErr ?? "").toLowerCase();
        const isKernelMismatch =
            stdErrLower.includes("invalid kernel binary format version") ||
            stdErrLower.includes("invalid sdk hash");

        if (isKernelMismatch && !autoRecoveryAttempted)
        {
            autoRecoveryAttempted = true;
            logDebug("Stale dart_format snapshot detected; re-activating once.");
            NotificationTools.notifyInfo(
                "DartFormat: Re-activating dart_format ...",
                "The Dart SDK seems to have changed since the last activation."
            );
            externalDartFormatProcess.kill();
            externalDartFormatProcess = undefined;
            if (!await DartFormatInstaller.tryInstall(false))
                return false;
            continue;
        }

        const jsonEncodedResponse = readLineResponse.stdOut ?? readLineResponse.stdErr ?? "<no response>";
        const jsonResponse = JsonTools.parseOrUndefined(jsonEncodedResponse);

        if (jsonResponse === undefined)
        {
            const title = "External dart_format: Expected connection details in JSON but received plain text.";

            let content = "";
            if (readLineResponse.stdOut)
                content += `\nStdOut: ${readLineResponse.stdOut}`;

            content += TimedReader.receiveLines(processStdOutReader, "stdout", "\nStdOut: ") ?? "";
            if (readLineResponse.stdErr)
                content += `\nStdErr: ${readLineResponse.stdErr}`;

            content += TimedReader.receiveLines(processStdErrReader, "stderr", "\nStdErr: ") ?? "";
            content = content.trim();

            if (content)
                content += "\n";

            content += "Did you install the dart_format package?\n" +
                "Basically just execute this:<pre>dart pub global activate dart_format</pre>";

            const actions = NotificationTools.createInstallActions("Install");
            NotificationTools.notifyError(title, content, actions);
            return false;
        }

        const baseUrl = JsonTools.getString(jsonResponse, "Message", "");
        const currentVersion = Version.parseOrUndefined(JsonTools.getString(jsonResponse, "CurrentVersion", ""));
        let latestVersion = Version.parseOrUndefined(JsonTools.getString(jsonResponse, "LatestVersion", ""));

        if (Constants.DEBUG_FAKE_NEW_VERSION && !autoUpdateAttempted)
        {
            latestVersion = Version.parse("999.999.999");
            logDebug(`DEBUG_FAKE_NEW_VERSION active; pretending latestVersion = ${latestVersion}`);
        }

        logDebug(`baseUrl:        ${baseUrl}`);
        logDebug(`currentVersion: ${currentVersion}`);
        logDebug(`latestVersion:  ${latestVersion}`);

        // Auto-update: if a newer version is announced and we haven't tried yet,
        // kill the running server, run `dart pub global activate dart_format`,
        // and restart. If update fails, we fall through next iteration with
        // autoUpdateAttempted=true and end up showing the manual Update action.
        if (currentVersion?.isOlderThan(latestVersion) && !autoUpdateAttempted)
        {
            autoUpdateAttempted = true;
            NotificationTools.notifyInfo(
                `DartFormat: A new version of dart_format is available (${latestVersion}).`,
                "Updating now ..."
            );
            externalDartFormatProcess.kill();
            externalDartFormatProcess = undefined;
            await DartFormatInstaller.tryInstall(true);
            continue;
        }

        dartFormatClient = new DartFormatClient(baseUrl);
        const httpResponse = await dartFormatClient.get("/status");
        if (httpResponse.status !== 200)
            throw DartFormatError.localError("External dart_format: Requested status but got: " + httpResponse.status + " " + httpResponse.body);

        let message = "External dart_format is ready.";
        if (Constants.DEBUG_CONNECTION)
            message += " " + JsonTools.stringify0(jsonResponse);

        NotificationTools.notifyInfo(message);

        // Only surface the manual Update notification when auto-update was already
        // attempted (and presumably failed). On a successful auto-update we restart
        // with the new version, so currentVersion === latestVersion in that case.
        if (currentVersion?.isOlderThan(latestVersion) && autoUpdateAttempted)
        {
            const title = "A new version of the dart_format package is available.";
            const content = "<pre>Current version: " + currentVersion + "\nLatest version:  " + latestVersion + "</pre>";
            const actions = NotificationTools.createInstallActions("Update");
            NotificationTools.notifyInfo(title, content, actions);
        }

        return true;
    }
}

function _notifyInstallFailed(reason: string): void
{
    const title = "Failed to start external dart_format: " + reason;
    const content = "Did you install the dart_format package?\n" +
        "Basically just execute this:<pre>dart pub global activate dart_format</pre>";
    const actions = NotificationTools.createInstallActions("Install");
    NotificationTools.notifyError(title, content, actions);
}
