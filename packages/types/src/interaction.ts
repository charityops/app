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
import { BasePersistedSchema, FieldValue, OmitForCreateSchema } from "./base";

export const InteractionSchema = BasePersistedSchema.extend({
  contactId: z.string(),
  description: z.string().optional(),
  interactionDate: z.string(),
  interactionDateEnd: z.string().optional(),
  name: z.string(),
  type: z.string(),
  userId: z.string().optional(),
  fields: z.record(FieldValue),
}).strict();
export type InteractionType = z.infer<typeof InteractionSchema>;

export const NewInteractionSchema = InteractionSchema.omit({
  ...OmitForCreateSchema,
}).strict();
export type NewInteractionType = z.infer<typeof NewInteractionSchema>;
