import { z } from "zod";
import { BasePersistedSchema } from "./base";

export const ConfigSchema = BasePersistedSchema.extend({
  type: z.enum(["contact-schema", "interaction-schema"]),
  value: z.object({}).passthrough(),
}).strict();
export type ConfigType = z.infer<typeof ConfigSchema>;

export const NewConfigSchema = ConfigSchema.omit({
  created: true,
  updated: true,
}).strict();
export type NewConfigType = z.infer<typeof NewConfigSchema>;

export const FieldConfigSchema = z.object({
  name: z.string(),
  element: z.enum(["input", "textarea", "select"]),
  required: z.boolean().optional(),
  label: z.string(),
});
export type FieldConfigType = z.infer<typeof FieldConfigSchema>;

export const InputFieldConfigSchema = FieldConfigSchema.extend({
  element: z.literal("input"),
  type: z.enum([
    "color",
    "date",
    "datetime-local",
    "email",
    "month",
    "number",
    "text",
    "url",
  ]),
  min: z.union([z.number(), z.string()]).optional(),
  max: z.union([z.number(), z.string()]).optional(),
  pattern: z.string().optional(),
});
export type InputFieldConfigType = z.infer<typeof InputFieldConfigSchema>;

export const SelectFieldConfigSchema = FieldConfigSchema.extend({
  element: z.literal("select"),
  multiple: z.boolean().optional(),
  values: z.array(
    z.union([z.string(), z.object({ label: z.string(), value: z.string() })])
  ),
});
export type SelectFieldConfigType = z.infer<typeof SelectFieldConfigSchema>;

export const FieldsConfigSchema = z.object({
  fields: z.array(FieldConfigSchema),
});
export type FieldsConfigType = z.infer<typeof FieldsConfigSchema>;
