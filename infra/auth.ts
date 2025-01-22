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
import { initApi } from "./api";
const region = aws.getRegionOutput().name;

export function initAuth(api: ReturnType<typeof initApi>) {
  const userPool = new sst.aws.CognitoUserPool("UserPool", {
    usernames: ["email"],
  });

  const userPoolClient = userPool.addClient("UserPoolClient");

  const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
    userPools: [
      {
        userPool: userPool.id,
        client: userPoolClient.id,
      },
    ],
    permissions: {
      authenticated: [
        {
          actions: ["execute-api:*"],
          resources: [
            $concat(
              "arn:aws:execute-api:",
              region,
              ":",
              aws.getCallerIdentityOutput({}).accountId,
              ":",
              api.nodes.api.id,
              "/*/*/*"
            ),
          ],
        },
      ],
    },
  });
  return { identityPool, userPool, userPoolClient };
}
