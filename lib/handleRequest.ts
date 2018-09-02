import { HTTPResponse } from "./HTTPResponse";
import { ProxyResult } from "aws-lambda";
import { HTTPError } from "./errors/HTTPError";

export async function handleRequest(handler: () => Promise<ProxyResult>, customErrorHandler?: (err: HTTPError) => Promise<ProxyResult>): Promise<ProxyResult> {
    try {
        return handler();
    } catch (err) {
        if (customErrorHandler) return customErrorHandler(err);
        const code = err.code || 500;
        const message = err.message || 'Oops, there was a problem.';
        return HTTPResponse.error(code, message);
    }
}
