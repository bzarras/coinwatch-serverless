import { CoinDataSource, CoinSymbol, Coin } from "../services/CoinDataSource";
import { CoinMarketCapDataSource } from "../services/CoinMarketCapDataSource";
import { MailService, MailRecipient } from "../services/MailService";

export class CronController {
    private readonly _validCoins: Set<string> = new Set([CoinSymbol.BTC, CoinSymbol.ETH, CoinSymbol.LTC]);

    async runDailyJob(): Promise<void> {
        const [coins, recipients] = await this.fetchCoinsAndRecipients();
        const filteredCoins = coins.filter(coin => this._validCoins.has(coin.symbol));
        
        const mailService = new MailService();
        for(const recipient of recipients) {
            await mailService.sendDailyAlertEmail({ recipient, coins: filteredCoins });
        }
    }

    async runFiveMinuteJob(): Promise<void> {

    }

    private async fetchCoinsAndRecipients(): Promise<[Coin[], MailRecipient[]]> {
        const coinDataSource: CoinDataSource = new CoinMarketCapDataSource(10);
        const coinsPromise = coinDataSource.fetchCoinData();
        const recipientsPromise: Promise<MailRecipient[]> = Promise.resolve([{ email: 'benzarras@gmail.com', phrase: 'SHpIpcWazRvu' }]);
        return [await coinsPromise, await recipientsPromise];
    }
}
