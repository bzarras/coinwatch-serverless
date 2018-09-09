import { CoinDataSource, CoinSymbol, Coin } from "../services/CoinDataSource";
import { CoinMarketCapDataSource } from "../services/CoinMarketCapDataSource";
import { SESMailService } from "../services/SESMailService";
import { MailRecipient } from '../services/MailService';
import { UsersService } from "../services/UsersService";

export class CronController {
    private readonly _validCoins: Set<string> = new Set([CoinSymbol.BTC, CoinSymbol.ETH, CoinSymbol.LTC]);

    async runDailyJob(): Promise<void> {
        const [coins, recipients] = await this.fetchCoinsAndRecipients();
        const filteredCoins = coins.filter(coin => this._validCoins.has(coin.symbol));
        
        const mailService = new SESMailService();
        const mailPromises = recipients.map(recipient => mailService.sendDailyAlertEmail({ toRecipient: recipient, aboutCoins: filteredCoins }));
        for (const sentMail of mailPromises) {
            await sentMail;
        }
    }

    async runFiveMinuteJob(): Promise<void> {

    }

    private async fetchCoinsAndRecipients(): Promise<[Coin[], MailRecipient[]]> {
        const coinDataSource: CoinDataSource = new CoinMarketCapDataSource(10);
        const usersService: UsersService = new UsersService();

        const coinsPromise = coinDataSource.fetchCoinData();
        const recipientsPromise = usersService.fetchAllUsers();

        return [await coinsPromise, await recipientsPromise];
    }
}
