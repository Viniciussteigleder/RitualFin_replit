import fs from "fs";
import path from "path";

type ContractResult = {
  id: string;
  ok: boolean;
  message?: string;
};

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5050/api";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function parseJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

function hasKeys(obj: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => Object.prototype.hasOwnProperty.call(obj, key));
}

async function login(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "demo", password: "demo" }),
  });
  assert(response.ok, `Login failed: ${response.status}`);
}

async function runHealthContract(): Promise<ContractResult> {
  const response = await fetch(`${API_BASE_URL}/health`);
  const body = await parseJson(response);
  assert(response.ok, `Health status ${response.status}`);
  assert(
    hasKeys(body, ["status", "timestamp", "database"]),
    "Health missing required keys."
  );
  assert(typeof body.status === "string", "Health.status must be string.");
  assert(typeof body.timestamp === "string", "Health.timestamp must be string.");
  assert(typeof body.database === "string", "Health.database must be string.");
  return { id: "API-CON-01", ok: true };
}

async function runVersionContract(): Promise<ContractResult> {
  const response = await fetch(`${API_BASE_URL}/version`);
  const body = await parseJson(response);
  assert(response.ok, `Version status ${response.status}`);
  assert(
    hasKeys(body, ["service", "gitSha", "buildTime", "env"]),
    "Version missing required keys."
  );
  assert(typeof body.service === "string", "Version.service must be string.");
  assert(typeof body.gitSha === "string", "Version.gitSha must be string.");
  assert(typeof body.buildTime === "string", "Version.buildTime must be string.");
  assert(typeof body.env === "string", "Version.env must be string.");
  return { id: "API-CON-02", ok: true };
}

async function runUploadsContract(): Promise<ContractResult> {
  const samplePath = path.join(
    process.cwd(),
    "attached_assets",
    "2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv"
  );
  const csvContent = fs.readFileSync(samplePath, "utf-8");

  const response = await fetch(`${API_BASE_URL}/uploads/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: path.basename(samplePath),
      csvContent,
      encoding: "utf-8",
    }),
  });
  const body = await parseJson(response);
  assert(response.ok, `Uploads status ${response.status}`);
  assert(
    hasKeys(body, ["success", "uploadId", "rowsTotal", "rowsImported", "duplicates", "monthAffected"]),
    "Uploads response missing required keys."
  );
  assert(typeof body.success === "boolean", "Uploads.success must be boolean.");
  assert(typeof body.uploadId === "string", "Uploads.uploadId must be string.");
  assert(typeof body.rowsTotal === "number", "Uploads.rowsTotal must be number.");
  assert(typeof body.rowsImported === "number", "Uploads.rowsImported must be number.");
  assert(typeof body.duplicates === "number", "Uploads.duplicates must be number.");
  assert(typeof body.monthAffected === "string", "Uploads.monthAffected must be string.");
  return { id: "API-CON-03", ok: true };
}

async function runTransactionsContract(): Promise<ContractResult> {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  const body = await parseJson(response);
  assert(response.ok, `Transactions status ${response.status}`);
  assert(Array.isArray(body), "Transactions response must be array.");
  const sample = body[0];
  assert(sample, "Transactions array empty.");
  assert(
    hasKeys(sample, ["id", "paymentDate", "amount", "currency", "descRaw", "needsReview", "manualOverride"]),
    "Transactions item missing required keys."
  );
  return { id: "API-CON-04", ok: true };
}

async function runSettingsContract(): Promise<ContractResult> {
  const response = await fetch(`${API_BASE_URL}/settings`);
  const body = await parseJson(response);
  assert(response.ok, `Settings status ${response.status}`);
  assert(
    hasKeys(body, ["id", "userId", "autoConfirmHighConfidence", "confidenceThreshold", "createdAt", "updatedAt"]),
    "Settings response missing required keys."
  );
  assert(typeof body.id === "string", "Settings.id must be string.");
  assert(typeof body.userId === "string", "Settings.userId must be string.");
  assert(typeof body.autoConfirmHighConfidence === "boolean", "Settings.autoConfirmHighConfidence must be boolean.");
  assert(typeof body.confidenceThreshold === "number", "Settings.confidenceThreshold must be number.");
  return { id: "API-CON-05", ok: true };
}

async function run() {
  const results: ContractResult[] = [];

  try {
    results.push(await runHealthContract());
    results.push(await runVersionContract());
    await login();
    results.push(await runUploadsContract());
    results.push(await runTransactionsContract());
    results.push(await runSettingsContract());

    console.log("API contract tests: PASS");
    for (const result of results) {
      console.log(`- ${result.id}: PASS`);
    }
  } catch (error: any) {
    console.error("API contract tests: FAIL");
    console.error(error.message || error);
    process.exit(1);
  }
}

run();
