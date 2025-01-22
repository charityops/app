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
import { type APIGatewayProxyEventV2 } from "aws-lambda";
import { BaseSchemaFields, NewUserSchema, type NewUserType, type UserType } from "@charityops/types";
import { ProblemError } from "../problem";
import { BasePersistence } from "./base";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export class UserPersistence extends BasePersistence<NewUserType, UserType> {
  immutableKeys = BaseSchemaFields;
  public readonly typeName = "user";

  async create(evt: APIGatewayProxyEventV2): Promise<UserType> {
    const item = this.parseBody<NewUserType>(evt, this.parseCreate);
    const hydratedItem = {
      ...item,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: hydratedItem,
      })
    );

    return hydratedItem as UserType;
  }

  parseCreate<NewUserType>(data: unknown): NewUserType {
    return NewUserSchema.parse(data) as NewUserType;
  }

  getIndexForAttribute(attribute: string): string {
    switch (attribute) {
      case "role":
        return "ByRole";
      default:
        throw new ProblemError({
          status: 400,
          detail: `Unknown attribute ${attribute}`,
        });
    }
  }
}
