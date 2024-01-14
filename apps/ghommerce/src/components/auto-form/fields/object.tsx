import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField } from "@/components/ui/form";
import type { useForm } from "react-hook-form";
import type * as z from "zod";

import { DEFAULT_ZOD_HANDLERS, INPUT_COMPONENTS } from "../config";
import type { FieldConfig, FieldConfigItem } from "../types";
import {
  beautifyObjectName,
  getBaseSchema,
  getBaseType,
  zodToHtmlInputProps,
} from "../utils";
import AutoFormArray from "./array";

function DefaultParent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function AutoFormObject<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SchemaType extends z.ZodObject<any, any>,
>({
  schema,
  form,
  fieldConfig,
  path = [],
}: {
  schema: SchemaType | z.ZodEffects<SchemaType>;
  form: ReturnType<typeof useForm>;
  fieldConfig?: FieldConfig<z.infer<SchemaType>>;
  path?: string[];
}) {
  console.log("AutoFormObject", schema);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { shape } = getBaseSchema<SchemaType>(schema);

  return (
    <div className="space-y-5">
      {Object.keys(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        shape,
      ).map((name) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const item = getBaseSchema(shape[name] as z.ZodAny);
        const zodBaseType = getBaseType(item);
        const itemName = item._def.description ?? beautifyObjectName(name);
        const key = [...path, name].join(".");

        if (zodBaseType === "ZodObject") {
          console.log("ZodObject", name);
          return (
            <Accordion
              type="multiple"
              className="space-y-5"
              key={key}
              defaultValue={[name]}
            >
              <AccordionItem value={name} key={key}>
                <AccordionTrigger>{itemName}</AccordionTrigger>
                <AccordionContent className="p-2">
                  <AutoFormObject
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    schema={item as unknown as z.ZodObject<any, any>}
                    form={form}
                    fieldConfig={
                      (fieldConfig?.[name] ?? {}) as FieldConfig<
                        z.infer<typeof item>
                      >
                    }
                    path={[...path, name]}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        }
        if (zodBaseType === "ZodArray") {
          console.log("ZodArray", name);
          return (
            <Accordion
              type="multiple"
              className="space-y-5"
              defaultValue={[name]}
              key={key}
            >
              <AutoFormArray
                key={key}
                name={name}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                item={item as unknown as z.ZodArray<any>}
                form={form}
                path={[...path, name]}
              />
            </Accordion>
          );
        }

        const fieldConfigItem: FieldConfigItem = fieldConfig?.[name] ?? {};
        const zodInputProps = zodToHtmlInputProps(item);
        const isRequired =
          zodInputProps.required ??
          fieldConfigItem.inputProps?.required ??
          false;

        return (
          <FormField
            control={form.control}
            name={key}
            key={key}
            render={({ field }) => {
              const inputType =
                fieldConfigItem.fieldType ??
                DEFAULT_ZOD_HANDLERS[zodBaseType] ??
                "fallback";

              const InputComponent =
                typeof inputType === "function"
                  ? inputType
                  : INPUT_COMPONENTS[inputType];
              const ParentElement =
                fieldConfigItem.renderParent ?? DefaultParent;

              return (
                <ParentElement key={`${key}.parent`}>
                  <InputComponent
                    zodInputProps={zodInputProps}
                    field={field}
                    fieldConfigItem={fieldConfigItem}
                    label={itemName}
                    isRequired={isRequired}
                    zodItem={item}
                    fieldProps={{
                      ...zodInputProps,
                      ...field,
                      ...fieldConfigItem.inputProps,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      value: !fieldConfigItem.inputProps?.defaultValue
                        ? field.value ?? ""
                        : undefined,
                    }}
                  />
                </ParentElement>
              );
            }}
          />
        );
      })}
    </div>
  );
}
