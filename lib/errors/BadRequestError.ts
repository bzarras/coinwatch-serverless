export class BadRequestError extends Error {
    readonly code: number;
    constructor(message: string) {
        super(message);
        this.code = 400;
    }
}
