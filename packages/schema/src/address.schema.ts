import { z } from "zod";

export const isValidAddress = (address: string) => {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

export const Address = z
  .string()
  .refine((value) => isValidAddress(value))
  .transform((value) => value.toLowerCase() as `0x${string}`)
  .describe(
    "String value that identifies the address of a specific user. Normally tied to an EOA that includes the Smart Wallet.",
  );

export type Address = z.infer<typeof Address>;
