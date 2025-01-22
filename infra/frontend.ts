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
/// <reference path="../.sst/platform/config.d.ts" />;

import { initAuth } from "./auth";

const region = aws.getRegionOutput().name;

export function initFrontend(api: sst.aws.ApiGatewayV2, {identityPool, userPool, userPoolClient}: ReturnType<typeof initAuth>) {
  return new sst.aws.StaticSite("FrontendApp", {
    path: "packages/frontend",
    build: {
      command: "npm run build",
      output: "dist",
    },
    environment: {
      VITE_REGION: region,
      VITE_API_URL: api.url,
      VITE_USER_POOL_ID: userPool.id,
      VITE_IDENTITY_POOL_ID: identityPool.id,
      VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
    },
  });
}
