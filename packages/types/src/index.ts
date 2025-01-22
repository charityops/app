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
export {
  BasePersistedSchema,
  OmitForCreateSchema,
  BaseSchemaFields,
  FieldValue,
} from "./base";
export {
  CommentSchema,
  type CommentType,
  NewCommentSchema,
  type NewCommentType,
} from "./comment";
export {
  ContactSchema,
  type ContactType,
  NewContactSchema,
  type NewContactType,
} from "./contact";
export {
  InteractionSchema,
  type InteractionType,
  NewInteractionSchema,
  type NewInteractionType,
} from "./interaction";
export { type UserType, NewUserSchema, type NewUserType } from "./user";

export { EventSchema, type EventType, TargetTypeSchema, type TargetTypeType } from "./event";
