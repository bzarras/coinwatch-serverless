import { HTTPResponse } from "./HTTPResponse";
import { ProxyResult } from "aws-lambda";
import { HTTPError } from "./errors/HTTPError";

export async function handleRequest(handler: () => Promise<ProxyResult>, customErrorHandler?: (err: HTTPError) => Promise<ProxyResult>): Promise<ProxyResult> {
    try {
        const result = await handler();
        return result;
    } catch (err) {
        console.log(err);
        if (customErrorHandler) return await customErrorHandler(err);
        const code = Number(err.code) || 500;
        const message = err.message || 'Oops, there was a problem.';
        return HTTPResponse.error(code, message);
    }
}
