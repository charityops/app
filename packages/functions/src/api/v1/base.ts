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
import { BasePersistedSchema } from "@charityops/types";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import FlexSearch from "flexsearch";
import { z } from "zod";
import { BasePersistence } from "../../lib/persistence/base";
import { toProblemResponse } from "../../lib/problem";
import { loadIndex } from "../../lib/search";
import { wrapper } from "../../lib/wrapper";
import { getLimit, getPathParameter, getUpdateCondition } from "../../util/request";
import { generateItemHeaders } from "../../util/response";

type BaseType = z.infer<typeof BasePersistedSchema>
let index: FlexSearch.Index;

export class V1ApiBase<C, I extends C & BaseType> {
  private persistence: BasePersistence<C, I>;

  constructor(persistence: BasePersistence<C, I>) {
    this.persistence = persistence;
  }

  async create(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const createdEvent = await this.persistence.create(evt);

      return {
        headers: generateItemHeaders(createdEvent),
        statusCode: 201,
        body: JSON.stringify(createdEvent),
      };
    });
  }

  async deleteItem(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const id = getPathParameter(evt.pathParameters, "id");
      await this.persistence.delete({ id });
      return {
        statusCode: 200,
      };
    });
  }

  async get(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const id = getPathParameter(evt.pathParameters, "id");
      const event = await this.persistence.get({ id });

      if (event) {
        return {
          statusCode: 200,
          body: JSON.stringify(event),
          headers: generateItemHeaders(event),
        };
      } else {
        return toProblemResponse(
          {
            status: 404,
            detail: "Interaction not found",
          },
          evt
        );
      }
    });
  }

  async list(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const limit = getLimit(evt);
      const cursor = evt.queryStringParameters?.cursor;
      const result = await this.persistence.list({ limit, cursor });
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    });
  }

  async listBy(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const limit = getLimit(evt);
      const cursor = evt.queryStringParameters?.cursor;
      const order = evt.queryStringParameters?.order as "asc" | "desc" | undefined;
      const attribute = getPathParameter(evt.pathParameters, "attribute");
      const value = getPathParameter(evt.pathParameters, "value");
      const result = await this.persistence.list({
        limit,
        cursor,
        order,
        index: {
          attribute,
          value,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    });
  }

  async patch(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const id = getPathParameter(evt.pathParameters, "id");
      const updatedContact = await this.persistence.update(
        { id },
        evt.body,
        getUpdateCondition(evt)
      );
      return {
        statusCode: 200,
        body: JSON.stringify(updatedContact),
        headers: generateItemHeaders(updatedContact),
      };
    });
  }

  async search(
    evt: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return wrapper(evt, async () => {
      const limit = getLimit(evt);
      const cursor = evt.queryStringParameters?.cursor;
      let start = 0;
      if(cursor) {
        try {
          start = parseInt(cursor, 10);
        }catch(err){
          return toProblemResponse(
            {
              status: 400,
              detail: "Invalid cursor: " + cursor+ " " + err,
            },
            evt
          );
        }
      } 
      const query = evt.queryStringParameters?.query;
      if(!index) {
        index = await loadIndex(this.persistence.typeName);
      }
      const ids = index.search(query || "", {
        limit,
        offset: start,
      });

      const items = await this.persistence.batchGet(ids.map((id) => ({ id })));
      return {
        statusCode: 200,
        body: JSON.stringify({
          items,
          cursor: ids.length === limit ? start + limit : undefined,
        }),
      };
    });
  }
}
