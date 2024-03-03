import {logDebug} from "./tools/LogTools";

export class DartFormatClient
{
    private readonly baseUrl: string;

    constructor(baseUrl: string)
    {
        this.baseUrl = baseUrl;
    }

    get(path: string)
    {
        const url = `${this.baseUrl}${path}`;
        const options =
            {
                method: "GET",
                headers:
                    {
                        "User-Agent": "DartFormatPlugin",
                        "Content-Type": "text/plain; charset=utf-8"
                    }
            };

        return fetch(url, options);
    }

    async post(path: String, entity?: string): Promise<Response>
    {
        const url = `${this.baseUrl}${path}`;
        const options =
            {
                method: "POST",
                headers:
                    {
                        "User-Agent": "DartFormatPlugin",
                        "Content-Type": "text/plain; charset=utf-8"
                    }
            };

        //httpRequest.entity = entity;

        const startTime = new Date();
        const response = await fetch(url, options);
        const endTime = new Date();
        const diffTime = endTime.getTime() - startTime.getTime();
        const diffTimeText = (diffTime < 1000) ? `${diffTime} ms` : `${diffTime / 1000.0} s`;
        logDebug("fetch took " + diffTimeText);

        return response;
    }
}
