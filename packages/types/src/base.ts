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

export const BasePersistedSchema = z.object({
  id: z.string(),
  created: z.string(),
  updated: z.string(),
  tags: z.array(z.string()).optional(),
});

export const OmitForCreateSchema = { id: true, created: true, updated: true, } as const;

export const BaseSchemaFields = Object.keys(OmitForCreateSchema);

export const FieldValue = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
