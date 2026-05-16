import {WorkspaceConfiguration} from "vscode";
import {logDebug} from "../tools/LogTools";
import {JsonTools} from "../tools/JsonTools";

export class Config
{
    private readonly addNewLineBeforeOpeningBrace: boolean;
    private readonly addNewLineAfterOpeningBrace: boolean;
    private readonly addNewLineBeforeClosingBrace: boolean;
    private readonly addNewLineAfterClosingBrace: boolean;
    private readonly addNewLineAfterSemicolon: boolean;
    private readonly addNewLineAtEndOfText: boolean;
    private readonly fixSpaces: boolean;
    private readonly removeTrailingCommas: boolean;
    private readonly indentationSpacesPerLevel: number;
    private readonly maxEmptyLines: number;

    private constructor(configuration: WorkspaceConfiguration)
    {
        this.addNewLineBeforeOpeningBrace = configuration.get<boolean>("lineBreaks.openingBraces.addBefore") ?? false;
        this.addNewLineAfterOpeningBrace = configuration.get<boolean>("lineBreaks.openingBraces.addAfter") ?? false;
        this.addNewLineBeforeClosingBrace = configuration.get<boolean>("lineBreaks.closingBraces.addBefore") ?? false;
        this.addNewLineAfterClosingBrace = configuration.get<boolean>("lineBreaks.closingBraces.addAfter") ?? false;
        this.addNewLineAfterSemicolon = configuration.get<boolean>("lineBreaks.semicolon.addAfter") ?? false;
        this.addNewLineAtEndOfText = configuration.get<boolean>("lineBreaks.endOfFile.add") ?? false;
        this.fixSpaces = configuration.get<boolean>("spaces.fix") ?? false;
        this.removeTrailingCommas = configuration.get<boolean>("removals.trailingCommas") ?? false;
        this.indentationSpacesPerLevel = configuration.get<number>("indentation.spacesPerLevel") ?? -1;
        this.maxEmptyLines = configuration.get<number>("emptyLines.maxAllowed") ?? -1;
    }

    static parse(configuration: WorkspaceConfiguration): Config | undefined
    {
        try
        {
            return new Config(configuration);
        }
        catch (e)
        {
            logDebug("Error parsing configuration: " + e);
            return undefined;
        }
    }

    hasNothingEnabled(): boolean
    {
        return !this.addNewLineBeforeOpeningBrace &&
            !this.addNewLineAfterOpeningBrace &&
            !this.addNewLineBeforeClosingBrace &&
            !this.addNewLineAfterClosingBrace &&
            !this.addNewLineAfterSemicolon &&
            !this.addNewLineAtEndOfText &&
            !this.fixSpaces &&
            !this.removeTrailingCommas &&
            this.indentationSpacesPerLevel < 0 &&
            this.maxEmptyLines < 0;
    }

    toJson(): Record<string, boolean | number>
    {
        return {
            "AddNewLineBeforeOpeningBrace": this.addNewLineBeforeOpeningBrace,
            "AddNewLineAfterOpeningBrace": this.addNewLineAfterOpeningBrace,
            "AddNewLineBeforeClosingBrace": this.addNewLineBeforeClosingBrace,
            "AddNewLineAfterClosingBrace": this.addNewLineAfterClosingBrace,
            "AddNewLineAfterSemicolon": this.addNewLineAfterSemicolon,
            "AddNewLineAtEndOfText": this.addNewLineAtEndOfText,
            "FixSpaces": this.fixSpaces,
            "RemoveTrailingCommas": this.removeTrailingCommas,
            "IndentationSpacesPerLevel": this.indentationSpacesPerLevel,
            "MaxEmptyLines": this.maxEmptyLines
        };
    }

    toJsonString(): string
    {
        return JsonTools.stringify0(this.toJson());
    }
}
