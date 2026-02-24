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
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
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
export enum SignalType {
    buy = "buy",
    hold = "hold",
    sell = "sell"
}
export interface backendInterface {
    clearAlerts(): Promise<void>;
    fetchTopCryptoNews(): Promise<string>;
    fetchTopCryptos(): Promise<string>;
    getAlertHistory(filterCrypto: string | null, filterSignal: SignalType | null): Promise<Array<Alert>>;
    getAlertStats(): Promise<[bigint, bigint, bigint]>;
    getAlertsLast24Hours(): Promise<Array<Alert>>;
    getCryptoAlertHistory(crypto: string): Promise<Array<Alert>>;
    getTheme(): Promise<string>;
    initializeUser(preferences: Preferences): Promise<void>;
    purgeOldAlerts(): Promise<void>;
    saveAlert(crypto: string, signalType: SignalType, triggerReason: TriggerReason | null, confidence: bigint, priceAtTrigger: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateTheme(theme: string): Promise<void>;
}
