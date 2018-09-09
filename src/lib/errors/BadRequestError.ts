import { HTTPError } from "./HTTPError";

export class BadRequestError extends Error implements HTTPError {
    readonly code = 400;
    constructor(message: string) {
        super(message);
    }
}
