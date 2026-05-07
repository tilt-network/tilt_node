# Tilt Node.js Client

This is the official Node.js client for submitting and processing data in the [Tilt](https://tilt.technology) distributed computing platform.

## Overview

Tilt enables distributed data processing by orchestrating multiple devices connected to a network. This client is responsible for reading input data, batching the content, and sending it to the Tilt API asynchronously.

## Installation

```bash
npm install tilt-node
```

## Requirements

- Node.js 18+

## Usage

### From a JSONL file

```typescript
import { Options, TextSourceHandler, Tilt, isSome } from "tilt-node";

const SECRET_KEY = process.env.SECRET_KEY;
const PROGRAM_ID = "your-program-uuid";

const dataSrc = new TextSourceHandler("input.jsonl");
const options = new Options(dataSrc, null, PROGRAM_ID, SECRET_KEY);

const tilt = await Tilt.create(options);
const results = await tilt.createAndPoll("my-job");

for (const [idx, item] of results) {
  if (isSome(item)) {
    console.log(`[${idx}]`, item.toString("utf-8"));
  }
}
```

### Passing data directly as `Buffer[]`

```typescript
import { Options, Tilt, isSome } from "tilt-node";

const SECRET_KEY = process.env.SECRET_KEY;
const PROGRAM_ID = "your-program-uuid";

const data = [
  Buffer.from(JSON.stringify({ date: "2024-03", devices: [] })),
  Buffer.from(JSON.stringify({ date: "2024-04", devices: [] })),
];

const options = new Options(null, data, PROGRAM_ID, SECRET_KEY);

const tilt = await Tilt.create(options);
const results = await tilt.createAndPoll("my-job");

for (const [idx, item] of results) {
  if (isSome(item)) {
    console.log(`[${idx}]`, item.toString("utf-8"));
  }
}
```

### Selecting the environment

```typescript
import { Environment, Options, Tilt } from "tilt-node";

const options = new Options(dataSrc, null, PROGRAM_ID, SECRET_KEY, Environment.STAGING);
const tilt = await Tilt.create(options);
```

Available environments: `Environment.PRODUCTION` (default), `Environment.STAGING`, `Environment.DEVELOPMENT`.

You can also override the base URL directly via the `API_BASE_URL` environment variable.

## API

### `Tilt.create(options)`

Async factory that authenticates and returns a ready-to-use `Tilt` instance.

### `tilt.createAndPoll(jobName?, maxWorkers?)`

High-level batch processor. Splits data into tasks, runs them concurrently, and polls for results.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `jobName` | `string` | `""` | Display name for the job |
| `maxWorkers` | `number` | `16` | Max concurrent tasks |

Returns `Array<[index, Buffer \| null]>` sorted by index.

### `tilt.uploadProgram(filepath, name?, description?)`

Uploads a WASM program file to the platform.

### `Options`

```typescript
new Options(
  dataSrc,     // TextSourceHandler | null
  data,        // Buffer[] | null
  programId,   // string
  secretKey,   // string
  environment, // Environment (optional, default: PRODUCTION)
)
```

Either `dataSrc` or `data` must be provided.

## Common Issues

### `buffer.File is an experimental feature`

This warning appears on Node.js 18 when using `FormData` with `Blob`. It is harmless and will be resolved in Node.js 20+. To suppress it:

```bash
node --no-warnings dist/your-script.js
```
# tilt_node
