
import { runFullDiagnostics } from "../src/lib/actions/diagnostics";
import { auth } from "../src/auth";

// Mock auth
jest.mock("../src/auth", () => ({
  auth: () => Promise.resolve({ user: { id: "user_2sQ3W4R5 ... " } }) // I need a real user ID
}));

async function main() {
  try {
     const result = await runFullDiagnostics();
     console.log(JSON.stringify(result, null, 2));
  } catch (e) {
     console.error(e);
  }
}

main();
