export interface CoinDataSource {
    fetchCoinData(): Promise<Coin[]>;
}

export interface Coin {
    name: string;
    symbol: string;
    price: string;
    percentChange24hr: string;
}

export enum CoinSymbol {
    BTC = 'BTC',
    ETH = 'ETH',
    LTC = 'LTC',
}
