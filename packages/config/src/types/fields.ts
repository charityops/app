/*
 * This file is part of the 2024 distribution (https://github.com/charity-ops).
 * Copyright (c) 2025 Dan Klco.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { z } from "zod";

export const FieldConfigSchema = z.object({
  name: z.string().min(2),
  element: z.enum(["columns", "fieldset", "input", "textarea", "search", "select"]),
  required: z.boolean().optional(),
  label: z.string(),
});
export type FieldConfigType = z.infer<typeof FieldsConfigSchema>;

export const InputFieldConfigSchema = FieldConfigSchema.extend({
  element: z.literal("input"),
  fieldType: z.enum([
    "color",
    "date",
    "datetime-local",
    "email",
    "month",
    "number",
    "tel",
    "text",
    "url",
  ]),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});
export type InputFieldConfigType = z.infer<typeof InputFieldConfigSchema>;

export const SearchableTypeNames = ["contacts", "interactions", "users"] as const;
export type SearchableTypeNamesType = typeof SearchableTypeNames[number];

export const SearchFieldConfigSchema = FieldConfigSchema.extend({
  element: z.literal("search"),
  type: z.enum(SearchableTypeNames),
});
export type SearchFieldConfigType = z.infer<typeof SearchFieldConfigSchema>;

export const SelectFieldConfigSchema = FieldConfigSchema.extend({
  element: z.literal("select"),
  multiple: z.boolean().optional(),
  options: z.array(
    z.union([z.string(), z.object({ label: z.string(), value: z.string() })])
  ),
});
export type SelectFieldConfigType = z.infer<typeof SelectFieldConfigSchema>;

export const TextareaFieldConfigSchema = FieldConfigSchema.extend({
  rows: z.number().optional(),
  element: z.literal("textarea"),
});
export type TextareaFieldConfigType = z.infer<typeof TextareaFieldConfigSchema>;

export const ColumnsConfigSchema = z.object({
  element: z.literal("columns"),
  fields: z.array(
    z.union([
      TextareaFieldConfigSchema,
      InputFieldConfigSchema,
      SelectFieldConfigSchema,
    ])
  ),
});
export type ColumnsConfigType = z.infer<typeof ColumnsConfigSchema>;

export const FieldSetConfigSchema = z.object({
  element: z.literal("fieldset"),
  label: z.string().min(2),
  fields: z.array(
    z.union([
      TextareaFieldConfigSchema,
      InputFieldConfigSchema,
      SelectFieldConfigSchema,
      ColumnsConfigSchema,
    ])
  ),
});
export type FieldSetConfigType = z.infer<typeof FieldSetConfigSchema>;

export const FieldsConfigSchema = z.object({
  indexFields: z.array(z.string()),
  fields: z.array(
    z.union([
      TextareaFieldConfigSchema,
      InputFieldConfigSchema,
      SelectFieldConfigSchema,
      FieldSetConfigSchema,
      ColumnsConfigSchema,
    ])
  ),
});
export type FieldsConfigType = z.infer<typeof FieldsConfigSchema>;

export type AllFields =
  | InputFieldConfigType
  | TextareaFieldConfigType
  | SelectFieldConfigType
  | ColumnsConfigType
  | FieldSetConfigType;
export type FormFields =
  | InputFieldConfigType
  | TextareaFieldConfigType
  | SelectFieldConfigType;
