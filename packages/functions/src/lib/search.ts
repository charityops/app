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

import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import FlexSearch from "flexsearch";
import { Resource } from "sst";

const s3Client = new S3Client({});

export async function loadIndex(key: string): Promise<FlexSearch.Index> {
  console.info("Loading index", key);
  try {
    const res = await s3Client.send(
      new ListObjectsCommand({
        Bucket: Resource.IndexStorage.name,
        Prefix: `${key}/`,
      })
    );

    const index = new FlexSearch.Index("memory");
    await Promise.all(
      (res.Contents ?? []).map(async (obj) => {
        if (!obj.Key) {
          return;
        }
        const part = await s3Client.send(
          new GetObjectCommand({
            Bucket: Resource.IndexStorage.name,
            Key: obj.Key,
          })
        );
        const partName = obj.Key.split("/").pop() || "";
        await index.import(
          partName,
          (await part.Body?.transformToString()) ?? ""
        );
      })
    );
    return index;
  } catch (err) {
    console.warn("Failed to load index", err);
    return new FlexSearch.Index("memory");
  }
}

export async function saveIndex(type: string, key: FlexSearch.Index): Promise<void> {
  console.info("Saving index", type);
  await key.export(async (id, value) => {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: Resource.IndexStorage.name,
        Key: `${type}/${id}`,
        Body: value,
      })
    );
  });
}
