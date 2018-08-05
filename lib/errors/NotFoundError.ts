export class NotFoundError extends Error {
    readonly code: number;
    constructor(message: string) {
        super(message);
        this.code = 404;
    }
}
