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
import { ContactConfigSchema, InteractionConfigSchema } from "./schemas.js";
import { BrandSchema } from "./brand.js";

export * from "./brand.js";
export * from "./fields.js";
export * from "./schemas.js";

export const ConfigSchema = z.object({
  brand: BrandSchema,
  schemas: z.object({
    contacts: z.record(z.string(), ContactConfigSchema),
    interactions: z.record(z.string(), InteractionConfigSchema),
  }),
});
export type ConfigType = z.infer<typeof ConfigSchema>;
