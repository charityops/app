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

import { logging } from "./util";
import { initEvents } from "./events";

export function initIndexing({ topic }: ReturnType<typeof initEvents>) {
  const bucket = new sst.aws.Bucket("IndexStorage");

  const indexingQueue = new sst.aws.Queue("IndexingQueue", {
    fifo: true,
  });
  topic.subscribeQueue("IndexingPubSubscriber", indexingQueue);

  indexingQueue.subscribe({
    handler: "packages/functions/src/events/indexing.handler",
    logging,
    link: [bucket, topic],
  });

  return { bucket };
}
