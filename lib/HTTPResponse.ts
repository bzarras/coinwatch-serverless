import { ProxyResult } from 'aws-lambda';

export class HTTPResponse {
    static html(html: string): ProxyResult {
        const response: ProxyResult = {
            statusCode: 200,
            headers: {
              'content-type': 'text/html'
            },
            body: html
        };
        return response;
    }

    static json(json: Object): ProxyResult {
        const response: ProxyResult = {
            statusCode: 200,
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify(json)
        };
        return response;
    }

    static redirect(url: string): ProxyResult {
        const response: ProxyResult = {
            statusCode: 301,
            headers: {
                'Location': url,
                'content-length': 0
            },
            body: ''
        };
        return response;
    }

    static error(code: number, message: string): ProxyResult {
        const response: ProxyResult = {
            statusCode: code,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ message })
        };
        return response;
    }
}
