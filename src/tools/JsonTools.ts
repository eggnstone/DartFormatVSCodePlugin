import {logDebug} from "./LogTools";
import {Constants} from "../Constants";

export class JsonTools
{
    // noinspection JSUnusedGlobalSymbols
    static stringify0(process: any): string
    {
        return JSON.stringify(process, null, 0);
    }

    // noinspection JSUnusedGlobalSymbols
    static stringify4(process: any): string
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
        if (Constants.DEBUG_JSON_TOOLS)
        {
            logDebug(`JsonTools.getString("${key}", "${def}")`);
        }
        return JsonTools.getOrUndefined(json, key)?.toString() ?? def;
    }

    // noinspection JSUnusedGlobalSymbols
    static getIntOrUndefined(json: any, key: string): number | undefined
    {
        if (Constants.DEBUG_JSON_TOOLS)
        {
            logDebug(`JsonTools.getIntOrUndefined("${key}")`);
        }
        return JsonTools.getOrUndefined(json, key);
    }

    static getOrUndefined(json: any, key: string): any | undefined
    {
        if (Constants.DEBUG_JSON_TOOLS)
        {
            logDebug(`JsonTools.getOrUndefined("${key}")`);
        }
        return json[key];
    }
}
