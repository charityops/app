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

import { getConfig } from "@charityops/config";
import {
  EventSchema,
  type CommentType,
  type ContactType,
  type EventType,
  type InteractionType,
  type UserType,
} from "@charityops/types";
import type { SQSEvent } from "aws-lambda";
import FlexSearch from "flexsearch";
import { stringify } from "yaml";
import { loadIndex, saveIndex } from "../lib/search";

function convertEvent(event: EventType): string {
  const { schemas } = getConfig();
  if (event.event === "delete") {
    throw new Error("Cannot map a delete event to a document");
  }
  let doc: Record<string, unknown>;
  if (event.targetType === "comment") {
    const { body, tags } = event.target as CommentType;
    doc = {
      body,
      tags,
    };
  } else if (event.targetType === "contact") {
    const { fields, name, tags, type } = event.target as ContactType;
    const indexFields = schemas.contacts[type].indexFields;
    doc = {
      name,
      fields: Object.fromEntries(
        Object.entries(fields).filter(([key]) => indexFields.includes(key))
      ),
      type,
      tags,
    };
  } else if (event.targetType === "interaction") {
    const { description, fields, interactionDate, name, tags, type } =
      event.target as InteractionType;
    const indexFields = schemas.contacts[type].indexFields;
    doc = {
      description,
      interactionDate,
      name,
      fields: Object.fromEntries(
        Object.entries(fields).filter(([key]) => indexFields.includes(key))
      ),
      type,
      tags,
    };
  } else {
    const user = event.target as UserType;
    doc = {
      name: user.name,
      email: user.id,
      tags: user.tags,
    };
  }
  return stringify(doc);
}

export const handler = async (event: SQSEvent) => {
  console.log("Received event", event);
  const res = await Promise.allSettled(
    event.Records.map(async (record) => {
      const body = JSON.parse(record.body);
      const message = JSON.parse(body.Message);
      return EventSchema.parse(message);
    })
  );
  res
    .filter((r) => r.status === "rejected")
    .forEach(async (r) => {
      console.error("Failed to parse event", r.reason);
    });

  const toIndex = res
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const types = new Set(toIndex.map((evt) => evt.targetType));
  console.info("Loading indexes", types);
  const indexes: Record<string, FlexSearch.Index> = Object.fromEntries(
    await Promise.all(
      Array.from(types).map(async (type) => {
        const index = await loadIndex(type);
        return [type, index];
      })
    )
  );

  console.log(`Indexing ${toIndex.length} events`);
  toIndex.forEach((evt) => {
    const index = indexes[evt.targetType];
    if (evt.event === "delete") {
      index.remove(evt.targetId);
    } else if (evt.event === "add") {
      index.add(evt.targetId, convertEvent(evt));
    } else {
      index.update(evt.targetId, convertEvent(evt));
    }
  });

  console.log("Saving indexes");
  await Promise.all(
    Object.entries(indexes).map(async ([type, index]) => {
      await saveIndex(type, index);
    })
  );

  return "ok";
};
