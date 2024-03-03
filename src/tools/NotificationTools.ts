import vscode from "vscode";
import {LinkInfo} from "../data/LinkInfo";
import {NotificationType} from "../enums/NotificationType";
import {logDebug} from "./LogTools";

export class NotificationTools
{
    static createCheckInstallationInstructionsLink(): LinkInfo
    {
        return new LinkInfo("Installation instructions for dart_format", "https://pub.dev/packages/dart_format/install");
    }

    static notifyError(message: string, content?: string, actions?: LinkInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Error, message, content, actions);
    }

    static notifyInfo(message: string, content?: string, actions?: LinkInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Info, message, content, actions);
    }

    static notifyWarning(message: string, content?: string, actions?: LinkInfo[]): void
    {
        // noinspection JSIgnoredPromiseFromCall
        this.notifyAsync(NotificationType.Warning, message, content, actions);
    }

    private static async notifyAsync(type: NotificationType, message: string, content?: string, actions?: LinkInfo[]): Promise<void>
    {
        const fixedContent = (content ?? "")
            .replace(/\n/g, " ")
            .replace(/<br\/>/g, " ")
            .replace(/<pre>/g, " ")
            .replace(/<\/pre>/g, " ");

        const linkInfoNames: string[] = actions?.map((linkInfo: LinkInfo) => linkInfo.name) ?? [];

        let linkInfoName: string | undefined = undefined;
        switch (type)
        {
            case NotificationType.Error:
                linkInfoName = await vscode.window.showErrorMessage<string>(message + " " + fixedContent, ...linkInfoNames);
                break;
            case NotificationType.Info:
                linkInfoName = await vscode.window.showInformationMessage<string>(message + " " + fixedContent, ...linkInfoNames);
                break;
            case NotificationType.Warning:
                linkInfoName = await vscode.window.showWarningMessage<string>(message + " " + fixedContent, ...linkInfoNames);
                break;
        }

        logDebug("linkInfoName: " + linkInfoName);
        if (!linkInfoName)
        {
            return;
        }

        const linkInfo = actions?.find((linkInfo: LinkInfo) => linkInfo.name === linkInfoName);
        if (linkInfo)
        {
            vscode.env.openExternal(vscode.Uri.parse(linkInfo.url));
        }
    }
}
