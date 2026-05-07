// Example 1: reading data from a JSONL file via TextSourceHandler
import path from "path";
import { fileURLToPath } from "url";
import { Environment, Options, TextSourceHandler, Tilt, isSome } from "../src/index.js";

// when compiled to dist/examples/, go up two levels to reach project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");

const SECRET_KEY = "sk_DYxgW9cgWOrgGK2W4EthYmfiVybDE91dr6Kug9dffH_DnS2MbAgEQblyO8sEaR2biGTP_JEi2rIgBvoKnPSj8Q";
const PROGRAM_ID = "e89f36c4-df07-4b65-a8da-503690cb57df";
const INPUT_FILE = path.join(PROJECT_ROOT, "examples", "data.jsonl");

console.log("=== Example 1: from JSONL file ===\n");

const dataSrc = new TextSourceHandler(INPUT_FILE);
const options = new Options(dataSrc, null, PROGRAM_ID, SECRET_KEY, Environment.STAGING);

const tilt = await Tilt.create(options);
const results = await tilt.createAndPoll("from-file-example");

console.log("\n===================\nResponses:\n");
for (const [idx, item] of results) {
  if (isSome(item)) {
    console.log(`[Task ${idx}]`, item.toString("utf-8"));
  } else {
    console.log(`[Task ${idx}] failed`);
  }
}
