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
import type { PreAuthenticationTriggerEvent, PreAuthenticationTriggerHandler } from "aws-lambda";
import { UserPersistence } from "../lib/persistence/user";
import { Resource } from "sst";

export const handler: PreAuthenticationTriggerHandler = async (
  event: PreAuthenticationTriggerEvent
) => {
  const { email } = event.request.userAttributes;

  const persistence = new UserPersistence(Resource.UsersTable.name);
  const user = await persistence.get({id: email});
  if (user) {
    return event;
  } 
  throw new Error("User not found");
};
