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
        address: "CBVQ4JXSU3NJFSVML5XCAYVB5GCIRRFEFOFFOUDTPYKJDB7OGFGCN3ZL",
        tokenId: "CC53W7SAOKASJXE5S774QK7LG33MYGLM4W6RN3CVQTSDXQURC7X4QRJ7",
        tokenDecimals: 18,
        tokenSymbol: "USDT",
        shareId: "CALVGRABWFAWGDSZJPJUL2TNLFDBOCYSETAUJJWNGDBOCMFQZJRTBRQN",
        shareDecimals: 7,
        shareSymbol: "VST",
        apy: "13.16%",
        expiration: "2024-06-28",
        underlying: "BTC Futures and Spot"
    }
];

