import vscode from "vscode";
import {NotificationType} from "../enums/NotificationType";
import {ActionInfo} from "../data/ActionInfo";
import {ExternalDartFormatTools} from "./ExternalDartFormatTools";

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

        // ProcessTools.spawn handles the platform plumbing (cmd.exe on Windows,
        // `$SHELL -ilc` on Unix to source rc files so `dart` is on PATH).
        const dartPath = installExternalDartFormatInfo.path!;
        const activateArgs = ["pub", "global", "activate", "dart_format"];
        return ActionInfo.createExternalAction(name + " dart_format", dartPath, activateArgs, successAction);
    }

    static notifyError(message: string, content?: string, actions?: ActionInfo[]): void
    {
        void this.notifyAsync(NotificationType.Error, message, content, actions);
    }

    static notifyInfo(message: string, content?: string, actions?: ActionInfo[]): void
    {
        void this.notifyAsync(NotificationType.Info, message, content, actions);
    }

    static notifyWarning(message: string, content?: string, actions?: ActionInfo[]): void
    {
        void this.notifyAsync(NotificationType.Warning, message, content, actions);
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
