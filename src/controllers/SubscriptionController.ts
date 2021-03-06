import { SubscribeRequest } from "../lib/SubscribeRequest";
import { UsersService, CoinwatchUser } from "../services/UsersService";
import { NotFoundError } from "../lib/errors/NotFoundError";
import { BadRequestError } from "../lib/errors/BadRequestError";
import * as validator from 'validator';
import * as randomstring from 'randomstring';
import * as jsonwebtoken from 'jsonwebtoken';
import * as rp from 'request-promise';
import * as pug from 'pug';
import * as path from 'path';
import { MailService } from "../services/MailService";
import { InternalServerError } from "../lib/errors/InternalServerError";
import { InvalidEmailError } from "../lib/errors/InvalidEmailError";

export class SubscriptionController {
    private readonly renderUnsubscribed = pug.compileFile(path.resolve(process.cwd(), 'static/views/unsubscribed.pug'));
    private readonly renderSubscribed = pug.compileFile(path.resolve(process.cwd(), 'static/views/subscription.pug'));
    private readonly renderVerificationEmail = pug.compileFile(path.resolve(process.cwd(), 'static/emailTemplates/verification.pug'));
    private readonly mailService: MailService;

    constructor(mailService: MailService) {
        this.mailService = mailService;
    }

    async subscribeUser(subscription: SubscribeRequest): Promise<CoinwatchUser> {
        console.log(subscription);

        // validate JWT
        if (!process.env.JWT_SECRET) {
            console.log('Uh oh! There is no JWT_SECRET in the environment');
            throw new InternalServerError('Sorry, the server is not configured to perform this action');
        }
        try {
            jsonwebtoken.verify(subscription.jwt, process.env.JWT_SECRET);
        } catch (err) {
            throw new BadRequestError('jwt is invalid or expired');
        }

        // validate email address
        if (!validator.isEmail(subscription.email)) throw new InvalidEmailError();

        // validate captcha
        if (!subscription.captchaResponse) throw new BadRequestError('User bypassed captcha. Probably a bot.');
        const isCaptchaValid = await this.validateCaptcha(subscription.captchaResponse);
        if (!isCaptchaValid) throw new BadRequestError('Captcha validation failed. You are probably a bot.');

        // now that request has been validated, process the subscription
        const { BTC, LTC, ETH } = subscription;
        const usersService = new UsersService();
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
        const emailHtml = this.renderVerificationEmail({ link: `https://coinwatch.fyi/verify?email=${encodeURIComponent(user.email)}&phrase=${user.phrase}`});
        await this.mailService.sendEmail({ email: user.email }, 'Please verify your email', emailHtml);
        return user;
    }

    async unsubscribeUser(email: string, phrase: string): Promise<void> {
        const usersService = new UsersService();
        await this.fetchAndValidateUser(email, phrase);

        await usersService.deleteUser(email);
        console.log(`${email} has successfully unsubscribed`);
    }

    async verifyEmail(email: string, phrase: string): Promise<void> {
        const usersService = new UsersService();
        const user = await this.fetchAndValidateUser(email, phrase);

        user.verified = true;
        await usersService.putUser(user);
        console.log(`${email} has been successfully verified`);
    }

    renderUnsubscribedPage(message: string): string {
        return this.renderUnsubscribed({ message });
    }

    renderSubscribePage(message: string): string {
        return this.renderSubscribed({ message });
    }

    private async fetchAndValidateUser(email: string, phrase: string): Promise<CoinwatchUser> {
        if (!validator.isEmail(email)) throw new BadRequestError('Email address is invalid');
        if (!validator.isAlphanumeric(phrase)) throw new BadRequestError('Phrase is malformed');

        const usersService = new UsersService();
        const user = await usersService.getUser(email);

        if (!user) throw new NotFoundError('User not found');
        if (user.phrase !== phrase) throw new BadRequestError('Mismatched phrases');
        
        return user;
    }

    private async validateCaptcha(captchaResponse: string): Promise<boolean> {
        try {
            const googleResponse = await rp({
                method: 'POST',
                uri: 'https://www.google.com/recaptcha/api/siteverify',
                formData: { // need to use 'formData', as opposed to 'body', because that is how google expects it
                    secret: process.env.CAPTCHA_SECRET_KEY,
                    response: captchaResponse
                },
                json: true // reponse body will be json, according to google
            });
            return googleResponse.success
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}
