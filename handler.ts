import { APIGatewayEvent, Context, ProxyResult, Handler, ScheduledEvent } from 'aws-lambda';
import * as querystring from 'querystring';
import { RootController } from './src/controllers/RootController';
import { HTTPResponse } from './src/lib/HTTPResponse';
import { SubscribeRequest } from './src/lib/SubscribeRequest';
import { CronController } from './src/controllers/CronController';
import { SubscriptionController } from './src/controllers/SubscriptionController';
import { handleRequest } from './src/lib/handleRequest';
import { BadRequestError } from './src/lib/errors/BadRequestError';
import { SESMailService } from './src/services/SESMailService';
import { InvalidEmailError } from './src/lib/errors/InvalidEmailError';

export const home: Handler = async (event: APIGatewayEvent, context: Context) => {
    logRequestSource(event);
    const rootController = new RootController();
    const indexHtml: string = rootController.renderHomePage();
    return HTTPResponse.html(indexHtml);
};

export const subscribe: Handler = async (event: APIGatewayEvent, context: Context) => {
    logRequestSource(event);
    const subscriptionController = new SubscriptionController(new SESMailService());
    return handleRequest(async () => {
        if (!event.body) throw new BadRequestError('Missing request body');
        const body = querystring.parse(event.body); // Body comes over the wire as URL-Encoded format, not JSON, since it's from an HTML form
        const subscribeRequest: SubscribeRequest = { // Should really validate all the body params first
            email: body.email as string,
            jwt: body.jwt as string,
            BTC: body.BTC as string,
            ETH: body.ETH as string,
            LTC: body.LTC as string
        };
        const newUser = await subscriptionController.subscribeUser(subscribeRequest);
        const html = subscriptionController.renderSubscribePage(`Sweet! We just sent a verification email to ${newUser.email}. Click the link in the email to finish signing up.`)
        return HTTPResponse.html(html);
    }, async (err) => {
        const code = Number(err.code) || 500;
        let html;
        if (err instanceof InvalidEmailError) {
            html = (new RootController()).renderHomePage({
                formError: {
                    message: `Sorry, that didn't look like a valid email address. Please try again.`
                }
            });
        } else {
            html = subscriptionController.renderSubscribePage(`Whoops, there was a problem. Please try again.`)
        }
        return HTTPResponse.errorHtml(code, html);
    });
};

export const unsubscribe: Handler = async (event: APIGatewayEvent, context: Context) => {
    logRequestSource(event);
    if (!event.queryStringParameters) return HTTPResponse.error(400, 'Bad Request. Missing query parameters.');
    const { email, phrase } = event.queryStringParameters;
    if (!email) return HTTPResponse.error(400, 'Bad Request. Missing client email');
    if (!phrase) return HTTPResponse.error(400, 'Bad Request. Missing client phrase');
    const subscriptionController = new SubscriptionController(new SESMailService());
    try {
        await subscriptionController.unsubscribeUser(email, phrase);
        const html = subscriptionController.renderUnsubscribedPage(`${email} has been unsubscribed from coinwatch emails.`)
        return HTTPResponse.html(html);
    } catch (err) {
        console.log(err);
        const errCode = err.code || 500;
        return HTTPResponse.error(errCode, 'There was a problem unsubscribing. Please try again later.');
    }
};

export const verifyEmail: Handler = async (event: APIGatewayEvent, context: Context) => {
    logRequestSource(event);
    return handleRequest(async () => {
        if (!event.queryStringParameters) throw new BadRequestError('Missing query parameters');
        if (!event.queryStringParameters.phrase || !event.queryStringParameters.email) throw new BadRequestError('Missing proper querystring parameters');
        const email = event.queryStringParameters.email;
        const phrase = event.queryStringParameters.phrase;
        const subscriptionController = new SubscriptionController(new SESMailService());
        await subscriptionController.verifyEmail(email, phrase);
        const html = subscriptionController.renderSubscribePage(`Sweet! ${email} has been verified. You will receive price alert emails at this address.`);
        return HTTPResponse.html(html);
    });
};

export const dailyAlert: Handler = async (event: ScheduledEvent, context: Context) => {
    const cronController = new CronController();
    await cronController.runDailyJob();
};

export const fiveMinuteAlert: Handler = async (event: ScheduledEvent, context: Context) => {
    const cronController = new CronController();
    await cronController.runFiveMinuteJob();
};

// If path is not recognized, redirect back to the home page.
// Perhaps the proper thing to do is just return a 404, which might be configurable
// within API Gateway itself.
export const catchAll: Handler = async (event: APIGatewayEvent, context: Context) => {
    return HTTPResponse.redirect(`${process.env.BASE_URL}/`);
};

function logRequestSource(event: APIGatewayEvent) {
    console.log(`Request from ${event.requestContext.identity.sourceIp} with user-agent: ${event.requestContext.identity.userAgent}`);
}
