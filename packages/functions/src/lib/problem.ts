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
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { randomUUID } from "crypto";

/**
 * @typedef {Object} ProblemObject
 * @property {string} type
 * @property {string} title
 * @property {number} status
 * @property {string} detail
 * @property {string} instance
 */

const STATUS_MAP: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Content Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
};

export type Problem = {
  status: number;
  title?: string;
  detail?: unknown;
  instance?: string;
};

export class ProblemError extends Error {
  problem: Problem;

  constructor(problem: Problem) {
    super(problem.title || STATUS_MAP[problem.status]);
    this.problem = problem;
  }
}

export function toProblemResponse(
  problem: Problem,
  evt: APIGatewayProxyEventV2
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: problem.status,
    headers: {
      "Content-Type": "application/problem+json",
    },
    body: JSON.stringify({
      ...problem,
      title: problem.title || STATUS_MAP[problem.status],
      instance: problem.instance || evt.requestContext.requestId || randomUUID(),
    }),
  };
}
