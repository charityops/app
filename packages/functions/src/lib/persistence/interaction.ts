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
  type InteractionType,
  NewInteractionSchema,
  type NewInteractionType,
} from "@charityops/types";
import { ProblemError } from "../problem";
import { BasePersistence } from "./base";

export class InteractionPersistence extends BasePersistence<
  NewInteractionType,
  InteractionType
> {
  immutableKeys = BaseSchemaFields;
  public readonly typeName = "interaction";

  parseCreate<NewInteractionType>(data: unknown): NewInteractionType {
    return NewInteractionSchema.parse(data) as NewInteractionType;
  }

  getIndexForAttribute(attribute: string): string {
    switch (attribute) {
      case "contactId":
        return "ByContactAndInteractionDate";
      case "type":
        return "ByTypeAndInteractionDate";
      case "recent":
        return "ByUpdated";
      default:
        throw new ProblemError({
          status: 400,
          detail: `Unknown attribute ${attribute}`,
        });
    }
  }
}
