"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DefaultValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import AutoFormObject from "./fields/object";
import type { FieldConfig } from "./types";
import type { ZodObjectOrWrapped } from "./utils";
import { getBaseSchema, getDefaultValues, getObjectFormSchema } from "./utils";
import { cn } from "@/components/utils.ts";

export function AutoFormSubmit({
  children,
  isLoading,
}: {
  children?: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Button type="submit" isLoading={isLoading} className="w-full">
      {children ?? "Submit"}
    </Button>
  );
}

function AutoForm<SchemaType extends ZodObjectOrWrapped>({
  formSchema,
  values: valuesProp,
  onValuesChange: onValuesChangeProp,
  onParsedValuesChange,
  onSubmit: onSubmitProp,
  fieldConfig,
  children,
  className,
}: {
  formSchema: SchemaType;
  values?: Partial<z.infer<SchemaType>>;
  onValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onParsedValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onSubmit?: (values: z.infer<SchemaType>) => void;
  fieldConfig?: FieldConfig<z.infer<SchemaType>>;
  children?: React.ReactNode;
  className?: string;
}) {
  const objectFormSchema = getObjectFormSchema(getBaseSchema(formSchema));
  const defaultValues: DefaultValues<z.infer<typeof objectFormSchema>> =
    getDefaultValues(objectFormSchema);

  const form = useForm<z.infer<typeof objectFormSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    values: valuesProp,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onSubmitProp?.(parsedValues.data);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("on submit");
          void form.handleSubmit(onSubmit)(e);
        }}
        onChange={() => {
          const values = form.getValues();
          console.log("on change", { values });
          onValuesChangeProp?.(values);
          const parsed = objectFormSchema.safeParse(values);
          if (parsed.success) {
            console.log("on parsed values change", parsed.data);
            onParsedValuesChange?.(parsed.data);
          }
        }}
        className={cn("space-y-5", className)}
      >
        <AutoFormObject
          schema={objectFormSchema}
          form={form}
          fieldConfig={fieldConfig}
        />
        {children}
      </form>
    </Form>
  );
}

export default AutoForm;
