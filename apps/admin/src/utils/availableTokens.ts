import {
  AvailableToken,
  BaseTokenSchema,
} from "ghommerce-schema/src/tokens.schema";

export const mappingTokenConfiguration: {
  [key in AvailableToken]: BaseTokenSchema[];
} = {
  USDC: [
    {
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      chainId: 5,
      address: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
    },
    {
      chainId: 80001,
      address: "0xdA5289fCAAF71d52a80A254da614a192b693e977",
    },
  ],
  USDT: [
    {
      chainId: 1,
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    {
      chainId: 5,
      address: "0x64ef393b6846114bad71e2cb2ccc3e10736b5716",
    },
    {
      chainId: 80001,
      address: "0xeaBc4b91d9375796AA4F69cC764A4aB509080A58",
    },
  ],
  GHO: [
    {
      chainId: 1,
      address: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
    },
    {
      chainId: 5,
      address: "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211",
    },
  ],
};
