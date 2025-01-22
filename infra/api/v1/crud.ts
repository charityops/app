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
/// <reference path="../../../.sst/platform/config.d.ts" />

import { ApiParams } from "..";
import { logging } from "../../util";

export function initV1CrudApi(
  params: ApiParams,
  api: sst.aws.ApiGatewayV2,
  name: string
) {
  api.route(`POST /v1/${name}`, {
    handler: `packages/functions/src/api/v1/${name}.create`,
    link: [params.storage[name]],
    logging,
  });
  api.route(`GET /v1/${name}/search`, {
    handler: `packages/functions/src/api/v1/${name}.search`,
    link: [params.storage[name], params.indexing.bucket],
    logging,
  });
  api.route(`GET /v1/${name}/{id}`, {
    handler: `packages/functions/src/api/v1/${name}.get`,
    link: [params.storage[name]],
    logging,
  });
  api.route(`GET /v1/${name}`, {
    handler: `packages/functions/src/api/v1/${name}.list`,
    link: [params.storage[name]],
    logging,
  });
  api.route(`GET /v1/${name}/{attribute}/{value}`, {
    handler: `packages/functions/src/api/v1/${name}.listBy`,
    link: [params.storage[name]],
    logging,
  });
  api.route(`DELETE /v1/${name}/{id}`, {
    handler: `packages/functions/src/api/v1/${name}.deleteItem`,
    link: [params.storage[name]],
    logging,
  });
  api.route(`PATCH /v1/${name}/{id}`, {
    handler: `packages/functions/src/api/v1/${name}.patch`,
    link: [params.storage[name]],
    logging,
  });
}
