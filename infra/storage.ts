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

export function initStorage() {
  const comments = new sst.aws.Dynamo("CommentTable", {
    fields: {
      id: "string",
      created: "string",
      itemId: "string",
      userId: "string",
    },
    primaryIndex: { hashKey: "id" },
    globalIndexes: {
      ByItemId: { hashKey: "itemId", rangeKey: "created" },
      ByUserId: { hashKey: "userId", rangeKey: "created" },
    },
    stream: "new-and-old-images",
  });

  const contacts = new sst.aws.Dynamo("ContactTable", {
    fields: {
      id: "string",
      status: "string",
      type: "string",
    },
    primaryIndex: { hashKey: "id" },
    globalIndexes: {
      ByStatus: { hashKey: "status" },
      ByType: { hashKey: "type" },
    },
    stream: "new-and-old-images",
  });

  const interactions = new sst.aws.Dynamo("InteractionTable", {
    fields: {
      id: "string",
      contactId: "string",
      interactionDate: "string",
      type: "string",
    },
    primaryIndex: { hashKey: "id" },
    globalIndexes: {
      ByContactAndInteractionDate: {
        hashKey: "contactId",
        rangeKey: "interactionDate",
      },
      ByTypeAndInteractionDate: {
        hashKey: "type",
        rangeKey: "interactionDate",
      },
    },
    stream: "new-and-old-images",
  });

  const users = new sst.aws.Dynamo("UsersTable", {
    fields: {
      id: "string",
      role: "string",
    },
    primaryIndex: { hashKey: "id" },
    globalIndexes: {
      ByRole: { hashKey: "role" },
    },
    stream: "new-and-old-images",
  });

  return { comments, contacts, interactions, users };
}
