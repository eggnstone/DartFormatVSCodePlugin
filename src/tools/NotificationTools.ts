import vscode from "vscode";
import {NotificationType} from "../enums/NotificationType";
import {ActionInfo} from "../data/ActionInfo";

export class NotificationTools
{
    static createCheckInstallationInstructionsAction(): ActionInfo
    {
        return ActionInfo.createBrowserAction("Installation instructions for dart_format", "https://pub.dev/packages/dart_format/install");
    }

    static createInstallAction(name: string): ActionInfo
    {
        const successAction = new ActionInfo("Restart extensions", async () => { await vscode.commands.executeCommand('workbench.action.restartExtensionHost'); });
        return ActionInfo.createExternalAction(name + " dart_format", "dart", ["pub", "global", "activate", "dart_format"], successAction);
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
        return [
            NotificationTools.createInstallAction(name),
            NotificationTools.createCheckInstallationInstructionsAction()
        ];
    }
}
