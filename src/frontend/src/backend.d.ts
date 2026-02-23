import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Position {
    quantity: number;
    symbol: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Trade {
    id: bigint;
    direction: Direction;
    date: string;
    crypto: string;
    notes: string;
    rationale: string;
    quantity: number;
    entryPrice: number;
    exitPrice?: number;
    outcome: string;
}
export interface Preferences {
    theme: string;
    notifications: boolean;
}
export interface Alert {
    triggerReason?: TriggerReason;
    priceAtTrigger: number;
    crypto: string;
    timestamp: bigint;
    confidence: bigint;
    signalType: SignalType;
}
export type TriggerReason = {
    __kind__: "trendFollowing";
    trendFollowing: boolean;
} | {
    __kind__: "priceBreak";
    priceBreak: string;
} | {
    __kind__: "takeProfit";
    takeProfit: number | null;
} | {
    __kind__: "rsiBelow30";
    rsiBelow30: string;
} | {
    __kind__: "riskReward";
    riskReward: number | null;
} | {
    __kind__: "stopLoss";
    stopLoss: number | null;
} | {
    __kind__: "macdCrossover";
    macdCrossover: string;
} | {
    __kind__: "rsiAbove70";
    rsiAbove70: string;
};
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum Direction {
    long_ = "long",
    short_ = "short"
}
export enum SignalType {
    buy = "buy",
    hold = "hold",
    sell = "sell"
}
export interface backendInterface {
    addPosition(symbol: string, quantity: number): Promise<void>;
    addToWatchlist(coin: string): Promise<void>;
    addTrade(trade: Trade): Promise<void>;
    clearAlerts(): Promise<void>;
    fetchTopCryptoNews(): Promise<string>;
    fetchTopCryptos(): Promise<string>;
    getAlertHistory(filterCrypto: string | null, filterSignal: SignalType | null): Promise<Array<Alert>>;
    getAlertStats(): Promise<[bigint, bigint, bigint]>;
    getAlertsLast24Hours(): Promise<Array<Alert>>;
    getCryptoAlertHistory(crypto: string): Promise<Array<Alert>>;
    getJournal(): Promise<Array<Trade>>;
    getPortfolio(): Promise<Array<Position>>;
    getTheme(): Promise<string>;
    getWatchlist(): Promise<Array<string>>;
    initializeUser(preferences: Preferences): Promise<void>;
    purgeOldAlerts(): Promise<void>;
    removeFromJournal(tradeId: bigint): Promise<void>;
    removeFromWatchlist(coin: string): Promise<void>;
    removePosition(symbol: string): Promise<void>;
    saveAlert(crypto: string, signalType: SignalType, triggerReason: TriggerReason | null, confidence: bigint, priceAtTrigger: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateTheme(theme: string): Promise<void>;
}
