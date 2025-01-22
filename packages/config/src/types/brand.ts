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

export const BrandSchema = z.object({
  name: z.string().min(3),
  colors: z
    .object({
      primary: z.string().optional(),
      text: z.string().optional(),
      link: z.string().optional(),
      info: z.string().optional(),
      success: z.string().optional(),
      warning: z.string().optional(),
      danger: z.string().optional(),
    })
    .optional(),
});
export type BrandType = z.infer<typeof BrandSchema>;
