export interface SubscribeRequest {
    email: string,
    jwt: string,
    captchaResponse: string,
    BTC?: string,
    ETH?: string,
    LTC?: string
}
