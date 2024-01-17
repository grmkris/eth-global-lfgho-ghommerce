import { z } from "zod";

export const isValidAddress = (address: string) => {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

export const Address = z
  .string()
  .refine((value) => isValidAddress(value))
  .transform((value) => value.toLowerCase() as `0x${string}`);

export type Address = z.infer<typeof Address>;

export const TransactionHash = z
  .string()
  .refine((value) => {
    const regex = /^0x[a-fA-F0-9]{64}$/;
    return regex.test(value);
  })
  .transform((value) => value.toLowerCase() as `0x${string}`);

export type TransactionHash = z.infer<typeof TransactionHash>;
