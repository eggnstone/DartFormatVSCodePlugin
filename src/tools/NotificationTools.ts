import vscode from "vscode";
import {NotificationType} from "../enums/NotificationType";
import {ActionInfo} from "../data/ActionInfo";
import {ExternalDartFormatTools} from "./ExternalDartFormatTools";
import {OsTools} from "./OsTools";

export class NotificationTools
{
    static createCheckInstallationInstructionsAction(): ActionInfo
    {
        return ActionInfo.createBrowserAction("Installation instructions for dart_format", "https://pub.dev/packages/dart_format/install");
    }

    static createInstallAction(name: string): ActionInfo | undefined
    {
        const successAction = new ActionInfo("Restart extensions", async () =>
        {
            await vscode.commands.executeCommand('workbench.action.restartExtensionHost');
        });

        const installExternalDartFormatInfo = ExternalDartFormatTools.getDartPathOrError();
        if (!installExternalDartFormatInfo.path)
            return undefined;

        const command = installExternalDartFormatInfo.path! + " pub global activate dart_format";

        if (OsTools.instance.isWindows)
            return ActionInfo.createExternalAction(name + " dart_format", command, successAction);

        const envPath = process.env["PATH"];
        const pubCacheBinPath = OsTools.instance.envHome + "/.pub-cache/bin";
        if (envPath && envPath.indexOf(pubCacheBinPath) >= 0)
            return ActionInfo.createExternalAction(name + " dart_format", command, successAction);

        const safeCommand = "export PATH=$PATH:" + pubCacheBinPath + " && " + command;
        return ActionInfo.createExternalAction(name + " dart_format", safeCommand, successAction);
    }

    static notifyError(message: string, content?: string, actions?: ActionInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Error, message, content, actions);
    }

    static notifyInfo(message: string, content?: string, actions?: ActionInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Info, message, content, actions);
    }

    static notifyWarning(message: string, content?: string, actions?: ActionInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Warning, message, content, actions);
    }

    static async notifyAsync(type: NotificationType, message: string, content?: string, actions?: ActionInfo[]): Promise<void>
    {
        const fixedContent = (content ?? "")
            .replace(/\n/g, " ")
            .replace(/<br\/>/g, " ")
            .replace(/<pre>/g, " ")
            .replace(/<\/pre>/g, " ");

        const actionNames = actions?.map((action: ActionInfo) => action.name) ?? [];

        let chosenActionName: string | undefined = undefined;
        switch (type)
        {
            case NotificationType.Error:
                chosenActionName = await vscode.window.showErrorMessage<string>(message + " " + fixedContent, ...actionNames);
                break;
            case NotificationType.Info:
                chosenActionName = await vscode.window.showInformationMessage<string>(message + " " + fixedContent, ...actionNames);
                break;
            case NotificationType.Warning:
                chosenActionName = await vscode.window.showWarningMessage<string>(message + " " + fixedContent, ...actionNames);
                break;
        }

        if (!chosenActionName)
            return;

        const chosenAction = actions?.find((action: ActionInfo) => action.name === chosenActionName);
        if (chosenAction)
            chosenAction.callback();
    }

    static createInstallActions(name: string)
    {
        const actions = [];

        const installAction = this.createInstallAction(name);
        if (installAction)
            actions.push(installAction);

        actions.push(this.createCheckInstallationInstructionsAction());

        return actions;
    }
}
