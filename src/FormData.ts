import {logDebug} from "./tools/LogTools";

export class FormData2
{
    private parts: any = {};

    append(name: string, data: any)
    {
        this.parts[name] = data;
    }

    generate(): any
    {
        const boundary = Date.now();
        const bodyParts = [];

        //logDebug("this.parts: " + this.parts);
        for (const partName of Object.keys(this.parts))
        {
            //logDebug("partName: " + partName);
            let partData = this.parts[partName];
            // @deprecated since v10.0.0 - Use `Buffer.from(string[, encoding])` instead.
            /*logDebug("partData: " + partData);
            const x2 = Buffer.from(partData);
            logDebug("x2: " + x2);*/
            /*const x = new Buffer(partData);
            logDebug("x: " + x);
            partData = x.toString();//'base64');*/
            //logDebug("partData: " + partData);

            bodyParts.push(
                '--' + boundary,
                'Content-Disposition: form-data; name="' + partName + '"',
                'Content-Type: text/plain; charset=utf-8',
                'Content-Transfer-Encoding: base64',
                '',
                partData);
        }

        bodyParts.push('--' + boundary + '--', '');
        //logDebug("bodyParts: " + bodyParts);
        //logDebug("bodyParts: " + bodyParts.join('\r\n'));

        return {
            method: 'POST',
            headers:
                {
                    "User-Agent": "DartFormatPlugin",
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                },
            body: bodyParts.join('\r\n')
        };
    }
}
