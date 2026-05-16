export class FormData
{
    private parts: Record<string, string> = {};

    append(name: string, data: string): void
    {
        this.parts[name] = data;
    }

    generate(): RequestInit
    {
        const boundary = Date.now();
        const bodyParts: string[] = [];

        for (const partName of Object.keys(this.parts))
        {
            bodyParts.push(
                '--' + boundary,
                'Content-Disposition: form-data; name="' + partName + '"',
                'Content-Type: text/plain; charset=utf-8',
                'Content-Transfer-Encoding: base64',
                '',
                this.parts[partName]);
        }

        bodyParts.push('--' + boundary + '--', '');

        return {
            method: 'POST',
            headers:
                {
                    "User-Agent": "DartFormatPlugin",
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'X-DartFormat-Client': '1'
                },
            body: bodyParts.join('\r\n')
        };
    }
}
