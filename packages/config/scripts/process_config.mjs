/* eslint-disable no-undef */
import { readFile, writeFile } from "fs/promises";
import { parse } from "yaml";
import { dirname } from "path";
import refParser from "@apidevtools/json-schema-ref-parser";
import { ConfigSchema } from "../dist/types/index.js";

const configPath = process.argv[2];

if (!configPath) {
  console.error("Usage: node scripts/process_config.js <config path>");
  process.exit(1);
}

/**
 *
 * @param {string} path
 * @returns {Promise<ConfigType>}
 */
async function readAndParseConfig(path) {
  const configStr = await readFile(path, "utf-8");
  const parsedConfig = parse(configStr);

  process.chdir(dirname(path));

  const resolved = await refParser.dereference(parsedConfig, {
    mutateInputSchema: false,
  });
  return ConfigSchema.parse(resolved);
}

const currentDir = process.cwd();
const config = await readAndParseConfig(configPath);


process.chdir(currentDir);

const configJs = await readFile("./dist/config.js", "utf-8");

const replaced = configJs.replace(
  "return undefined;",
  `return ${JSON.stringify(config)};`
);

await writeFile("./dist/config.js", replaced);
