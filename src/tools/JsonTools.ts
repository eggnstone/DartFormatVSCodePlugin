export class JsonTools
{
    // noinspection JSUnusedGlobalSymbols
    static stringify(process: any)
    {
        return JSON.stringify(process, null, 4);
    }
}
