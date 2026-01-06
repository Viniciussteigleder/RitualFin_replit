/**
 * Synchronous IPv4 DNS resolution fallback
 * This runs INSIDE the server process if bootstrap.cjs didn't run
 */
const dns = require("node:dns");
const { execSync } = require("node:child_process");

/**
 * Resolve hostname to IPv4 using system DNS (synchronous)
 * Falls back to multiple methods if one fails
 */
function resolveToIPv4Sync(hostname) {
  console.log(`[IPv4-Resolver] Attempting to resolve ${hostname} to IPv4...`);

  // Method 1: Try getent hosts (Linux)
  try {
    const output = execSync(`getent hosts ${hostname}`, { encoding: "utf8", timeout: 5000 });
    const lines = output.trim().split("\n");

    for (const line of lines) {
      const [ip] = line.trim().split(/\s+/);
      if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
        console.log(`[IPv4-Resolver] ✓ Resolved via getent: ${hostname} → ${ip}`);
        return ip;
      }
    }
  } catch (err) {
    console.log(`[IPv4-Resolver] getent failed, trying dig...`);
  }

  // Method 2: Try dig +short (most Unix systems)
  try {
    const output = execSync(`dig +short ${hostname} A`, { encoding: "utf8", timeout: 5000 });
    const ips = output.trim().split("\n").filter(line => /^\d+\.\d+\.\d+\.\d+$/.test(line.trim()));

    if (ips.length > 0) {
      const ip = ips[0];
      console.log(`[IPv4-Resolver] ✓ Resolved via dig: ${hostname} → ${ip}`);
      return ip;
    }
  } catch (err) {
    console.log(`[IPv4-Resolver] dig failed, trying nslookup...`);
  }

  // Method 3: Try nslookup (Windows/Unix fallback)
  try {
    const output = execSync(`nslookup ${hostname}`, { encoding: "utf8", timeout: 5000 });
    const lines = output.split("\n");

    for (const line of lines) {
      const match = line.match(/^Address:\s*(\d+\.\d+\.\d+\.\d+)$/);
      if (match) {
        const ip = match[1];
        console.log(`[IPv4-Resolver] ✓ Resolved via nslookup: ${hostname} → ${ip}`);
        return ip;
      }
    }
  } catch (err) {
    console.log(`[IPv4-Resolver] nslookup failed`);
  }

  console.error(`[IPv4-Resolver] ✗ FAILED: Could not resolve ${hostname} to IPv4 using any method`);
  return null;
}

/**
 * Force IPv4 resolution on DATABASE_URL if not already done
 * This is a safety net if bootstrap.cjs didn't run
 */
function ensureIPv4DatabaseUrl() {
  // Check if bootstrap already ran
  if (process.env.BOOTSTRAP_IPV4_RESOLVED === "true") {
    console.log("[IPv4-Resolver] ✓ Bootstrap already ran, skipping fallback resolution");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.log("[IPv4-Resolver] ⚠️  DATABASE_URL not set, skipping");
    return;
  }

  try {
    const url = new URL(process.env.DATABASE_URL);
    const hostname = url.hostname;

    // Skip if already IPv4
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      console.log(`[IPv4-Resolver] ✓ Already using IPv4: ${hostname}`);
      return;
    }

    console.log(`[IPv4-Resolver] ⚠️  Bootstrap did NOT run - applying fallback resolution`);
    console.log(`[IPv4-Resolver] Hostname: ${hostname}`);

    // Resolve synchronously
    const ipv4 = resolveToIPv4Sync(hostname);

    if (ipv4) {
      // Update DATABASE_URL
      url.hostname = ipv4;
      process.env.DATABASE_URL = url.toString();
      process.env.FALLBACK_IPV4_RESOLVED = "true";

      console.log(`[IPv4-Resolver] ✓ DATABASE_URL updated to use IPv4: ${ipv4}`);
    } else {
      console.error(`[IPv4-Resolver] ✗ CRITICAL: Failed to resolve ${hostname}`);
      console.error(`[IPv4-Resolver] ✗ Database connections will likely fail with ENETUNREACH`);
      console.error(`[IPv4-Resolver] ✗ FIX: Set Render Start Command to: npm start`);
    }
  } catch (error) {
    console.error(`[IPv4-Resolver] ✗ Error during fallback resolution: ${error.message}`);
  }
}

module.exports = { ensureIPv4DatabaseUrl, resolveToIPv4Sync };
