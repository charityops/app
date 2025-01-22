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

import { initStorage } from "./storage";
import { logging } from "./util";

export function initEvents(storage: ReturnType<typeof initStorage>) {
  const topic = new sst.aws.SnsTopic("EventTopic", {
    fifo: true,
  });
  const link = [topic];
  storage.comments.subscribe("CommentEventSubscriber", {
    handler: "packages/functions/src/events/subscriber.handler",
    logging,
    link,
    environment: {
      EVENT_TYPE: "comment",
    },
  });
  storage.contacts.subscribe("ContactEventSubscriber", {
    handler: "packages/functions/src/events/subscriber.handler",
    logging,
    link,
    environment: {
      EVENT_TYPE: "contact",
    },
  });
  storage.interactions.subscribe("InteractionEventSubscriber", {
    handler: "packages/functions/src/events/subscriber.handler",
    logging,
    link,
    environment: {
      EVENT_TYPE: "interaction",
    },
  });
  storage.users.subscribe("UserEventSubscriber", {
    handler: "packages/functions/src/events/subscriber.handler",
    logging,
    link,
    environment: {
      EVENT_TYPE: "user",
    },
  });

  return { topic };
}
