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
/// <reference path="../../.sst/platform/config.d.ts" />

import { initIndexing } from "../indexing";
import { initStorage } from "../storage";
import { initV1Api } from "./v1";
import { logging } from "../util";

export type ApiParams = {
  stage: string;
  email: sst.aws.Email;
  storage: ReturnType<typeof initStorage>;
  indexing: ReturnType<typeof initIndexing>;
};

export function initApi(params: ApiParams) {
  const { stage } = params;

  const api = new sst.aws.ApiGatewayV2("Api", {
    accessLog: logging,
    domain: stage === "production" ? process.env.API_URL : undefined,
    cors: true,
  });
  api.route(
    "GET /health",
    {
      handler: "packages/functions/src/api/health.handler",
      link: [params.email],
      logging,
    },
    {
      auth: false,
    }
  );

  initV1Api(params, api);

  api.route(
    "$default",
    {
      handler: "packages/functions/src/api/default.handler",
      logging,
    },
    { auth: false }
  );
  return api;
}
