import { SubscribeRequest } from "../lib/SubscribeRequest";
import { UsersService } from "../services/UsersService";
import { NotFoundError } from "../lib/errors/NotFoundError";
import { BadRequestError } from "../lib/errors/BadRequestError";
import * as validator from 'validator';
import * as pug from 'pug';
import * as path from 'path';

export class SubscriptionController {
    private readonly renderUnsubscribed = pug.compileFile(path.resolve(process.cwd(), 'static/views/unsubscribed.pug'));

    async subscribeUser(subscription: SubscribeRequest) {
        // This code is copied over from the other codebase.
        // This will largely need to change becasue, a) TypeScript wants more
        // rigid types, and b) the way I will be storing users and currencies
        // will be fundamentally different. SQL database will be queried differently.
        let currencies = {};
        // if (subscription.BTC) currencies.BTC = true;
        // if (subscription.ETH) currencies.ETH = true;
        // if (subscription.LTC) currencies.LTC = true;
        if (Object.keys(currencies).length === 0) currencies = { BTC: true, ETH: true, LTC: true };
    }

    async unsubscribeUser(email: string, phrase: string): Promise<void> {
        if (!validator.isEmail(email)) throw new BadRequestError('Email address is invalid');
        if (!validator.isAlphanumeric(phrase)) throw new BadRequestError('Phrase is malformed');

        const usersService = new UsersService();
        const user = await usersService.getUser(email);

        if (!user) throw new NotFoundError('User not found');
        if (user.phrase !== phrase) throw new BadRequestError('Mismatched phrases');

        await usersService.deleteUser(email);
    }

    renderUnsubscribedPage(message: string): string {
        return this.renderUnsubscribed({ message });
    }
}
