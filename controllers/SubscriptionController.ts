import { SubscribeRequest } from "../lib/SubscribeRequest";

export class SubscriptionController {

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
}
