import { HTTPError } from "./HTTPError";

export class InternalServerError extends Error implements HTTPError {
    readonly code = 500;
    constructor(message: string) {
        super(message);
    }
}
