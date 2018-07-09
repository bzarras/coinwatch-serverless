import { CoinDataSource, Coin } from './CoinDataSource';
import * as rp from 'request-promise';

export class CoinMarketCapDataSource implements CoinDataSource {
    private readonly _baseUrl = 'https://api.coinmarketcap.com/v1/ticker/';
    private _queryLimit: number;
    
    constructor(queryLimit?: number) {
        this._queryLimit = queryLimit || 0;
    }

    async fetchCoinData(): Promise<Coin[]> {
        const tickers: CoinMarketCapTickerData[] = await rp({
            uri: this._baseUrl,
            qs: { limit: this._queryLimit || 0 },
            json: true
        });
        return tickers.map(ticker => ({
            name: ticker.name,
            symbol: ticker.symbol,
            price: Number(ticker.price_usd).toFixed(2),
            percentChange24hr: ticker.percent_change_24h
        }));
    }
}

interface CoinMarketCapTickerData {
    name: string;
    symbol: string;
    price_usd: string;
    percent_change_24h: string;
    percent_change_1h: string;
}
