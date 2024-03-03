import {logDebug} from "./LogTools";

export class JsonTools
{
    // noinspection JSUnusedGlobalSymbols
    static stringify0(process: any)
    {
        return JSON.stringify(process, null, 0);
    }

    // noinspection JSUnusedGlobalSymbols
    static stringify4(process: any)
    {
        return JSON.stringify(process, null, 4);
    }

    static parseOrUndefined(jsonEncodedResponse: string): any | undefined
    {
        try
        {
            return JSON.parse(jsonEncodedResponse);
        }
        catch (e)
        {
            return undefined;
        }
    }

    static getString(json: any, key: string, def: string): string
    {
        logDebug(`JsonTools.getString(${key}, ${def})`);
        return json[key]?.toString() ?? def;
    }
}
