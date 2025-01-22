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
import type {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { ProblemError } from "../lib/problem";
import type { UpdateCondition } from "../lib/persistence/base";

export function getPathParameter(
  parameters: APIGatewayProxyEventPathParameters | undefined,
  key: string
): string {
  const type = parameters?.[key];
  if (!type) {
    throw new ProblemError({
      status: 400,
      detail: `Missing path parameter: ${key}`,
    });
  }
  return type;
}

export function getLimit(evt: APIGatewayProxyEventV2): number {
  const limit = parseInt(evt.queryStringParameters?.limit || "25", 10);
  if (limit < 1 || limit > 25) {
    throw new ProblemError({
      status: 400,
      detail: "Invalid limit",
    });
  }
  return limit;
}

export function getUpdateCondition(
  evt: APIGatewayProxyEventV2
): UpdateCondition | undefined {
  const updated = evt.headers["if-unmodified-since"];
  if (updated) {
    return { updated };
  }
}
