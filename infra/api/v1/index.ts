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
import { initV1Comments } from "./comments";
import { initV1Contacts } from "./contacts";
import { initV1Interactions } from "./interactions";
import { initV1Users } from "./users";

export function initV1Api(params: ApiParams, api: sst.aws.ApiGatewayV2) {
  initV1Comments(params, api);
  initV1Contacts(params, api);
  initV1Interactions(params, api);
  initV1Users(params, api);
}
