// Define the Pool type
export interface Pool {
    name: string;
    address: string;
    tokenId: string;
    tokenDecimals: number;
    tokenSymbol: string;
    shareId: string;
    shareDecimals: number;
    shareSymbol: string;
    apy: string;
    expiration: string;
    underlying: string;
}

// Define the pool options
export const poolOptions: Pool[] = [
    {
        name: "BTC (June-24)",
        address: "CCTU5JLVTEOTGQVI7R2AQFM642N5LOD4ZAMDE6T7IF5Y2GGQM5Q72LKK",
        tokenId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
        tokenDecimals: 18,
        tokenSymbol: "USDC",
        shareId: "CCI2JMTDKVWUBBWDALWQBOLTCTJPTXTNUA46T4ILTWOYRD3TA64NBJDA",
        shareDecimals: 7,
        shareSymbol: "VST",
        apy: "13.16%",
        expiration: "2024-06-28",
        underlying: "BTC Futures and Spot"
    }
];

