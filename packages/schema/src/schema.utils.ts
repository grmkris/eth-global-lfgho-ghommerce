import { z, ZodType } from "zod";

export function numericEnum<TValues extends readonly number[]>(
  values: TValues,
) {
  return z.coerce.number().superRefine((val, ctx) => {
    if (!values.includes(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        options: [...values],
        received: val,
      });
    }
  }) as ZodType<TValues[number]>;
}

export const filterArray = <S>(itemSchema: z.ZodType<S>) => {
  const catchValue = {} as never;

  return z
    .array(itemSchema.catch(catchValue))
    .transform((a) => a.filter((o) => o !== catchValue))
    .catch([]);
};
