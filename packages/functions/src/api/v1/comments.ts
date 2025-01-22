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
import { Resource } from "sst";
import { CommentPersistence } from "../../lib/persistence/comment";
import { type CommentType, type NewCommentType } from "@charityops/types";
import { V1ApiBase } from "./base";
import { type APIGatewayProxyEventV2 } from "aws-lambda";

const persistence = new CommentPersistence(Resource.CommentTable.name);

const api = new V1ApiBase<NewCommentType, CommentType>(persistence);

export const create = (evt: APIGatewayProxyEventV2) => api.create(evt);
export const deleteItem = (evt: APIGatewayProxyEventV2) => api.deleteItem(evt);
export const get = (evt: APIGatewayProxyEventV2) => api.get(evt);
export const list = (evt: APIGatewayProxyEventV2) => api.list(evt);
export const listBy = (evt: APIGatewayProxyEventV2) => api.listBy(evt);
export const patch = (evt: APIGatewayProxyEventV2) => api.patch(evt);
export const search = (evt: APIGatewayProxyEventV2) => api.search(evt);
