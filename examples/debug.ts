// Debug: check each API call step by step
import { Connection } from "../src/connection.js";
import { Options } from "../src/options.js";
import { Environment } from "../src/types.js";

const SECRET_KEY = "sk_DYxgW9cgWOrgGK2W4EthYmfiVybDE91dr6Kug9dffH_DnS2MbAgEQblyO8sEaR2biGTP_JEi2rIgBvoKnPSj8Q";
const PROGRAM_ID = "e89f36c4-df07-4b65-a8da-503690cb57df";
const CHUNK = Buffer.from(`{"date":"2024-03","timeRange":4,"initHour":"8","timeZone":"-3","devices":[]}`, "utf-8");

const options = new Options(null, null, PROGRAM_ID, SECRET_KEY, Environment.STAGING);
const conn = new Connection(options);

// 1. Sign in
console.log("1. Signing in to:", options.baseUrl);
const signInResult = await conn.skSignIn(SECRET_KEY);
if (signInResult.isErr()) {
  console.error("Sign in FAILED:", signInResult.value.message);
  process.exit(1);
}
const { token, organization } = signInResult.value;
options.authToken = token;
options.organizationId = organization.id;
console.log("Sign in OK. org_id:", organization.id);

// 2. Create job
console.log("\n2. Creating job with program_id:", PROGRAM_ID);
const jobResult = await conn.createJob("debug-job");
if (jobResult.isErr()) {
  console.error("Create job FAILED:", jobResult.value.message);
  process.exit(1);
}
const job = jobResult.value;
console.log("Job created:", JSON.stringify({ id: job.id, status: job.status, program_id: job.programId }));

// 3. Create task
console.log("\n3. Creating task...");
const taskResult = await conn.createTask(job.id!, 0);
if (taskResult.isErr()) {
  console.error("Create task FAILED:", taskResult.value.message);
  process.exit(1);
}
const task = taskResult.value;
console.log("Task created:", JSON.stringify({ id: task.id, status: task.status }));

// 4. Run task
console.log("\n4. Running task with", CHUNK.length, "bytes of data...");
const runResult = await conn.runTask(task.id!, CHUNK);
if (runResult.isErr()) {
  console.error("Run task FAILED:", runResult.value.message);
  process.exit(1);
}
console.log("Run task response:", JSON.stringify({ id: runResult.value.id, status: runResult.value.status }));

// 5. Poll download
console.log("\n5. Polling download...");
const orgId = organization.id!;
const jobId = job.id!;
const taskId = task.id!;
const baseUrl = options.baseUrl;
const downloadUrl = `${baseUrl}/processed_data/${orgId}/${jobId}/processed/${taskId}.dat`;
console.log("Download URL:", downloadUrl);

for (let i = 0; i < 5; i++) {
  await new Promise(r => setTimeout(r, 3000));
  const resp = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
  console.log(`  attempt ${i + 1}: HTTP ${resp.status}`);
  if (resp.status === 200) {
    const buf = Buffer.from(await resp.arrayBuffer());
    console.log("  Result:", buf.toString("utf-8"));
    break;
  } else {
    console.log("  Body:", await resp.text());
  }
}
