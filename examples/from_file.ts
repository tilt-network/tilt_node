import { Options, TextSourceHandler, Tilt, isSome } from "../src/index.js";

const SECRET_KEY = process.env["SECRET_KEY"];
if (!SECRET_KEY) throw new Error("SECRET_KEY environment variable is missing");

const PROGRAM_ID = "c6e024e0-ad75-45ca-94b4-bbeadb4eebfa";
const INPUT_FILE = "shipping_calculation.jsonl";

const dataSrc = new TextSourceHandler(INPUT_FILE);
const options = new Options(dataSrc, null, PROGRAM_ID, SECRET_KEY);

const tilt = await Tilt.create(options);
const results = await tilt.createAndPoll();

const texts: string[] = [];
for (const [, item] of results) {
  if (isSome(item)) {
    texts.push(item.toString("utf-8"));
  }
}

console.log("\n===================\nResponse:\n");
console.log(texts.join(" "));
