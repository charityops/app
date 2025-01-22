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
import { toProblemResponse } from "../lib/problem";

export const handler = async (
  evt: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (evt.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        Allow: "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
        "Cache-Control": "max-age=604800",
      },
      body: "",
    };
  }
  return toProblemResponse(
    {
      status: 405,
    },
    evt
  );
};
