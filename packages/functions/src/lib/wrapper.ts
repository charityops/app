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
import { ProblemError, toProblemResponse } from "./problem";

export type HandlerFunction = () =>
  | Promise<APIGatewayProxyStructuredResultV2>
  | APIGatewayProxyStructuredResultV2;

export async function wrapper(
  evt: APIGatewayProxyEventV2,
  cb: HandlerFunction
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    return await cb();
  } catch (err) {
    if ((err as ProblemError).problem) {
      console.error("Caught problem error", err);
      const problem = (err as ProblemError).problem;
      return toProblemResponse(problem, evt);
    } else {
      console.error("Caught unexpected error", err);
      return toProblemResponse(
        {
          status: 500,
          detail: err,
        },
        evt
      );
    }
  }
}
