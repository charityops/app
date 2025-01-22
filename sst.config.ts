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
/// <reference path="./.sst/platform/config.d.ts" />

import { initApi } from "./infra/api";
import { initAuth } from "./infra/auth";
import { initEmail } from "./infra/email";
import { initEvents } from "./infra/events";
import { initFrontend } from "./infra/frontend";
import { initIndexing } from "./infra/indexing";
import { initStorage } from "./infra/storage";

export default $config({
  app(input) {
    return {
      name: "@charityops/app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    console.log(`Running: ${JSON.stringify($app)}`);
    const email = initEmail();
    const storage = initStorage();
    const events = initEvents(storage);
    const indexing = initIndexing(events);
    const api = initApi({ email, indexing, stage: $app.stage, storage });
    const auth = initAuth(api);

    const frontend = initFrontend(api, auth);

    return {
      api: api.url,
      frontend: frontend.url,
    };
  },
});
