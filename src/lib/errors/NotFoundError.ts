import { HTTPError } from "./HTTPError";

export class NotFoundError extends Error implements HTTPError {
    readonly code = 404;
    constructor(message: string) {
        super(message);
    }
}
