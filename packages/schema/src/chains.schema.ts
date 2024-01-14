import { z } from "zod";
import { numericEnum } from "./schema.utils.ts";

export const EnabledChains = {
  testnet: [
    "eth-sepolia",
    "eth-goerli",
    "matic-mumbai",
    "avalanche-testnet",
    "bsc-testnet",
    "arbitrum-goerli",
    // "gnosis-testnet",
  ],
  mainnet: [
    "base-mainnet",
    "eth-mainnet",
    "matic-mainnet",
    "bsc-mainnet",
    "avalanche-mainnet",
    "optimism-mainnet",
    "arbitrum-mainnet",
    "gnosis-mainnet",
  ],
} as const;

export const _ChainIds = {
  ETH: 1,
  POL: 137,
  BSC: 56,
  DAI: 100,
  OKT: 66,
  FTM: 250,
  AVA: 43114,
  ARB: 42161,
  HEC: 128,
  OPT: 10,
  ONE: 1666600000,
  FSN: 32659,
  MOR: 1285,
  EXP: 2,
  TCH: 7,
  UBQ: 8,
  MET: 11,
  DIO: 15,
  CEL: 42220,
  FUS: 122,
  TLO: 40,
  CRO: 25,
  BOB: 288,
  SHI: 27,
  GL1: 29,
  RSK: 30,
  TBW: 35,
  VEL: 106,
  MOO: 1284,
  MAM: 1088,
  AUR: 1313161554,
  SOL: 1151111081099710,
  TER: 1161011141099710,
  OAS: 111971151099710,
  EVM: 9001,
  ARN: 42170,
  ERA: 324,
  PZE: 1101,
  LNA: 59144,
  BAS: 8453,
  GOR: 5,
  METT: 12,
  DIOT: 13,
  MUM: 80001,
  ARBG: 421613,
  OPTG: 420,
  BSCT: 97,
  HECT: 256,
  ONET: 1666700000,
  FUST: 123,
  TLOT: 41,
  RSKT: 31,
  SOLT: 1151111081161011,
  TERT: 1161011141161011,
  OAST: 1119711511610111,
  AVAT: 43113,
  EVMT: 9000,
  MORT: 1287,
  FTMT: 4002,
  LNAT: 59140,
} as const;

export const ChainIds = [
  1, 137, 56, 100, 66, 250, 43114, 42161, 128, 10, 1666600000, 32659, 1285, 2,
  7, 8, 11, 15, 42220, 122, 40, 25, 288, 27, 29, 30, 35, 106, 1284, 1088,
  1313161554, 1151111081099710, 1161011141099710, 111971151099710, 9001, 42170,
  324, 1101, 59144, 8453, 5, 12, 13, 80001, 421613, 420, 97, 256, 1666700000,
  123, 41, 31, 1151111081161011, 1161011141161011, 1119711511610111, 43113,
  9000, 1287, 4002, 59140,
] as const;

export const ChainId = numericEnum(ChainIds);
export type ChainId = z.infer<typeof ChainId>;

export const ChainNameToId = {
  "eth-sepolia": 250,
  "eth-goerli": 5,
  "matic-mumbai": 80001,
  "avalanche-testnet": 43113,
  "bsc-testnet": 97,
  "arbitrum-goerli": 421613,
  "eth-mainnet": 1,
  "matic-mainnet": 137,
  "bsc-mainnet": 56,
  "avalanche-mainnet": 43114,
  "optimism-mainnet": 10,
  "arbitrum-mainnet": 42161,
  "gnosis-mainnet": 100,
  "base-mainnet": 8453,
  // "gnosis-testnet": 10200, // TODO add this back
} as const;

export const ChainIdToName = Object.fromEntries(
  Object.entries(ChainNameToId).map(([name, id]) => [id, name]),
) as Record<number, Chain>;

export const Chains = [
  ...EnabledChains.testnet,
  ...EnabledChains.mainnet,
] as const;
export const Chain = z.enum(Chains);
export type Chain = z.infer<typeof Chain>;

export const ChainSchema = z.object({
  name: Chain,
  displayName: z.string(),
  id: z.number(),
  logoURI: z.string().optional(),
  isTestnet: z.boolean().optional(),
});
export type ChainSchema = z.infer<typeof ChainSchema>;
