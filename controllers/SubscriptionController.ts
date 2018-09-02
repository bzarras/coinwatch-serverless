import { SubscribeRequest } from "../lib/SubscribeRequest";
import { UsersService, CoinwatchUser } from "../services/UsersService";
import { NotFoundError } from "../lib/errors/NotFoundError";
import { BadRequestError } from "../lib/errors/BadRequestError";
import * as validator from 'validator';
import * as randomstring from 'randomstring';
import * as pug from 'pug';
import * as path from 'path';
import { MailService } from "../services/MailService";

export class SubscriptionController {
    private readonly renderUnsubscribed = pug.compileFile(path.resolve(process.cwd(), 'static/views/unsubscribed.pug'));
    private readonly renderSubscribed = pug.compileFile(path.resolve(process.cwd(), 'static/views/subscription.pug'));
    private readonly renderVerificationEmail = pug.compileFile(path.resolve(process.cwd(), 'static/views/emailTemplates/verification.pug'));

    async subscribeUser(subscription: SubscribeRequest): Promise<CoinwatchUser> {
        if (!validator.isEmail(subscription.email)) throw new BadRequestError('Email address is invalid');
        const { BTC, LTC, ETH } = subscription;
        const usersService = new UsersService();
        const mailService = new MailService();
        const user: CoinwatchUser = {
            email: subscription.email,
            currencies: {
                BTC: !!BTC,
                LTC: !!LTC,
                ETH: !!ETH
            },
            phrase: randomstring.generate(12),
            verified: false
        };
        await usersService.putUser(user);
        const emailHtml = this.renderVerificationEmail({ link: `https://coinwatch.fyi/verify?phrase=${user.phrase}`});
        await mailService.sendEmail({ email: user.email }, 'Please verify your email', emailHtml);
        return user;
    }

    async unsubscribeUser(email: string, phrase: string): Promise<void> {
        if (!validator.isEmail(email)) throw new BadRequestError('Email address is invalid');
        if (!validator.isAlphanumeric(phrase)) throw new BadRequestError('Phrase is malformed');

        const usersService = new UsersService();
        const user = await usersService.getUser(email);

        if (!user) throw new NotFoundError('User not found');
        if (user.phrase !== phrase) throw new BadRequestError('Mismatched phrases');

        await usersService.deleteUser(email);
        console.log(`${email} has successfully unsubscribed`);
    }

    renderUnsubscribedPage(message: string): string {
        return this.renderUnsubscribed({ message });
    }

    renderSubscribePage(message: string): string {
        return this.renderSubscribed({ message });
    }
}
