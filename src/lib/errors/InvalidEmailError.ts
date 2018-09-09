import { BadRequestError } from "./BadRequestError";

export class InvalidEmailError extends BadRequestError {
    constructor() {
        super('Email address is invalid');
    }
}
