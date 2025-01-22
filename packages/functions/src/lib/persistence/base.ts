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
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  ScanCommand,
  type ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { z, ZodError } from "zod";
import { ProblemError } from "../problem";
import { BasePersistedSchema } from "@charityops/types";
import { apply_patch } from "jsonpatch";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

export type ListRequest = {
  limit: number;
  cursor: string | undefined;
  order?: "asc" | "desc";
  index?: {
    attribute: string;
    value: unknown;
  };
};

export type ListResponse<I> = {
  items: I[];
  count: number;
  cursor: string | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyType = Record<string, any>;

export type UpdateCondition = { updated: string };

export abstract class BasePersistence<
  C,
  O extends C & z.infer<typeof BasePersistedSchema>
> {
  protected readonly tableName: string;
  protected readonly documentClient: DynamoDBDocumentClient;
  protected abstract immutableKeys: string[];
  public readonly abstract typeName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.documentClient = DynamoDBDocumentClient.from(new DynamoDBClient(), {});
  }

  abstract parseCreate<C>(data: unknown, evt: APIGatewayProxyEventV2): C;

  abstract getIndexForAttribute(attribute: string): string;

  protected toListResponse(result: ScanCommandOutput): ListResponse<O> {
    return {
      items: result.Items as O[],
      count: result.Count ?? 0,
      cursor: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
            "base64"
          )
        : undefined,
    };
  }

  protected parseBody<T>(
    evt: APIGatewayProxyEventV2,
    parseFn: (data: unknown, evt: APIGatewayProxyEventV2) => T
  ): T {
    if (!evt.body) {
      throw new ProblemError({
        status: 400,
        detail: "Missing request body",
      });
    }
    try {
      const data = JSON.parse(evt.body);
      return parseFn(data, evt);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ProblemError({
          status: 400,
          detail: { message: "Invalid request body", errors: err.errors },
        });
      }
      throw new ProblemError({
        status: 400,
        detail: "Invalid request body",
      });
    }
  }

  async batchGet(keys: KeyType[]): Promise<O[]> {
    const result = await this.documentClient.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: keys,
          },
        },
      })
    );
    return (result.Responses?.[this.tableName] ?? []) as O[];
  }

  async create(evt: APIGatewayProxyEventV2): Promise<O> {
    const item = this.parseBody<O>(evt, this.parseCreate);
    const hydratedItem = {
      ...item,
      id: randomUUID(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: hydratedItem,
      })
    );

    return hydratedItem as O;
  }

  async delete(key: KeyType): Promise<void> {
    await this.documentClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: key,
      })
    );
    // TODO handle delete cleanup
  }

  async get(key: KeyType): Promise<O | undefined> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: key,
      })
    );
    return result.Item as O;
  }

  async list(request: ListRequest): Promise<ListResponse<O>> {
    const { limit, cursor, index } = request;
    const ExclusiveStartKey = cursor
      ? JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"))
      : undefined;

    const input: QueryCommandInput = {
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey,
      ScanIndexForward: request.order !== "desc",
    };

    let result: QueryCommandOutput;
    if (index) {
      const { attribute, value } = index;
      input.IndexName = this.getIndexForAttribute(attribute);
      input.KeyConditionExpression = `#v = :v`;
      input.ExpressionAttributeNames = {
        "#v": attribute,
      };
      input.ExpressionAttributeValues = {
        ":v": value,
      };

      result = await this.documentClient.send(new QueryCommand(input));
    } else {
      result = await this.documentClient.send(new ScanCommand(input));
    }

    return this.toListResponse(result);
  }

  async update(
    key: KeyType,
    patchBody: string | undefined,
    condition?: UpdateCondition
  ): Promise<O> {
    const doc = (await this.get(key)) as O & { [key: string]: unknown };

    if (!doc) {
      throw new ProblemError({
        status: 404,
        detail: "Not found",
      });
    }

    let updated: O & { [key: string]: unknown };
    try {
      const patch = JSON.parse(patchBody as string);
      updated = apply_patch(doc, patch);
    } catch (err) {
      throw new ProblemError({
        status: 400,
        detail:
          "Invalid patch request: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
    const immutableUpdates = this.immutableKeys.filter(
      (key) => updated[key] !== doc[key]
    );
    if (immutableUpdates.length > 0) {
      throw new ProblemError({
        status: 400,
        detail: `Immutable field(s) updated: ${immutableUpdates.join(", ")}`,
      });
    }

    const Item = {
      ...updated,
      updated: new Date().toISOString(),
    };
    const command: PutCommandInput = {
      TableName: this.tableName,
      Item,
    };

    if (condition && "updated" in condition && condition.updated) {
      console.log("Update condition", condition.updated);
      command.ConditionExpression = "#u = :u AND #i = :i";
      command.ExpressionAttributeNames = { "#u": "updated", "#i": "id" };
      command.ExpressionAttributeValues = {
        ":u": condition.updated,
        ":i": (Item as O).id,
      };
    }

    try {
      await this.documentClient.send(new PutCommand(command));
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "ConditionalCheckFailedException"
      ) {
        throw new ProblemError({
          status: 412,
          detail: "Update condition failed",
        });
      }
      throw err;
    }

    return Item as O;
  }
}
