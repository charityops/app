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

import { type EventType, type TargetTypeType } from "@charityops/types";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";
import { Resource } from "sst";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "crypto";

const sns = new SNSClient({});

const EVENT_MAP = {
  INSERT: "add",
  MODIFY: "update",
  REMOVE: "delete",
} as const;

function mapRecord(record: DynamoDBRecord): EventType | undefined {
  console.info("Processing record", record.eventID);
  if (!record.eventName) {
    console.error("Invalid event record, no event name", record);
    return undefined;
  }
  const event = EVENT_MAP[record.eventName];
  const targetType = process.env.EVENT_TYPE as TargetTypeType;
  if (!targetType) {
    console.error("Invalid event record, invalid target type", record);
    return undefined;
  }

  if (event === "delete") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleted = unmarshall(record.dynamodb?.OldImage || ({} as any));
    if (!deleted.id) {
      console.error("Invalid delete event, no id", record);
      return undefined;
    }
    return {
      id: record.eventID || randomUUID(),
      event,
      targetType,
      targetId: deleted.id,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target = unmarshall(record.dynamodb?.NewImage || ({} as any));
  if (!target.id) {
    console.error("Invalid add/update event, no id", record);
    return undefined;
  }

  return {
    id: record.eventID || randomUUID(),
    event,
    targetType,
    targetId: target.id,
    target,
  };
}

async function sendEvent(event?: EventType) {
  if (!event) {
    return;
  }
  console.info("Sending event", event.id);
  await sns.send(
    new PublishCommand({
      TopicArn: Resource.EventTopic.arn,
      Message: JSON.stringify(event),
      MessageGroupId: event.targetType,
      MessageDeduplicationId: event.id,
    })
  );
}

export const handler = async (event: DynamoDBStreamEvent) => {
  await Promise.all(
    event.Records.map(mapRecord).filter(Boolean).map(sendEvent)
  );
  return "ok";
};
