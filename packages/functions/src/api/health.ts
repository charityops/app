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
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { wrapper } from "../lib/wrapper";
import { toProblemResponse } from "../lib/problem";

const checks: {name: string, check: () => Promise<void>}[] = [];

export const handler = async (
  evt: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  return wrapper(evt, async () => {
    const results = await Promise.allSettled(
      checks.map((check) => check.check())
    );

    const failedChecks = results
      .map(({ status }, index) =>
        status === "rejected" ? checks[index].name : undefined
      )
      .filter(Boolean);

    if (failedChecks.length > 0) {
      return toProblemResponse(
        {
          status: 500,
          detail: "Failed checks: " + failedChecks.join(", "),
        },
        evt
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OK", checks: checks.map((c) => c.name) }),
    };
  });
};
