import { APIGatewayEvent, Context, ProxyResult, Handler, ScheduledEvent } from 'aws-lambda';
import { RootController } from './controllers/RootController';
import { HTTPResponse } from './lib/HTTPResponse';
import { SubscribeRequest } from './lib/SubscribeRequest';
import { CronController } from './controllers/CronController';

export const home: Handler = async (event: APIGatewayEvent, context: Context) => {
    const rootController = new RootController();
    const indexHtml: string = rootController.renderHomePage();
    return HTTPResponse.html(indexHtml);
};

export const subscribe: Handler = async (event: APIGatewayEvent, context: Context) => {
    if (!event.body) return HTTPResponse.error(400, 'Bad Request. Missing request body');
    let body: SubscribeRequest;
    try {
        body = JSON.parse(event.body);
    } catch (err) {
        console.log(err);
        return HTTPResponse.error(400, 'Bad Request. Body is not valid JSON');
    }
};

export const unsubscribe: Handler = async (event: APIGatewayEvent, context: Context) => {

};

export const dailyAlert: Handler = async (event: ScheduledEvent, context: Context) => {
    const cronController = new CronController();
    await cronController.runDailyJob();
};

// If path is not recognized, redirect back to the home page.
// Perhaps the proper thing to do is just return a 404, which might be configurable
// within API Gateway itself.
export const catchAll: Handler = async (event: APIGatewayEvent, context: Context) => {
    return HTTPResponse.redirect(`${process.env.BASE_URL}/`);
};
