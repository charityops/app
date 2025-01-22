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
import {
  BaseSchemaFields,
  type CommentType,
  NewCommentSchema,
  type NewCommentType,
} from "@charityops/types";
import { ProblemError } from "../problem";
import { BasePersistence } from "./base";

export class CommentPersistence extends BasePersistence<
  NewCommentType,
  CommentType
> {
  immutableKeys = [...BaseSchemaFields, "userId"];
  public readonly typeName = "comment";

  parseCreate<NewCommentType>(data: unknown): NewCommentType {
    const newComment = NewCommentSchema.parse(data) as NewCommentType;

    // TODO add userId from JWT
    return newComment;
  }

  getIndexForAttribute(attribute: string): string {
    switch (attribute) {
      case "itemId":
        return "ByItemId";
      case "userId":
        return "ByUserId";
      default:
        throw new ProblemError({
          status: 400,
          detail: `Unknown attribute ${attribute}`,
        });
    }
  }
}
