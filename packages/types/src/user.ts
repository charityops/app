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
import { BasePersistedSchema } from "./base";

export const UserSchema = BasePersistedSchema.extend({
  name: z.string(),
  role: z.enum(["admin", "power_user", "user", "viewer"]),
}).strict();
export type UserType = z.infer<typeof UserSchema>;

export const NewUserSchema = UserSchema.omit({created: true, updated: true,}).strict();
export type NewUserType = z.infer<typeof NewUserSchema>;
