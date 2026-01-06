const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");

// Support override via env (e.g., DNS_RESULT_ORDER=ipv6first node bootstrap.cjs)
const order = process.env.DNS_RESULT_ORDER || "ipv4first";
dns.setDefaultResultOrder(order);

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║              RitualFin Bootstrap - IPv4 Hardening            ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log(`[BOOTSTRAP] DNS order preference: ${order}`);

// Pre-resolve DATABASE_URL hostname to IPv4 and inject into environment
// This ensures the PostgreSQL pool uses IPv4 address directly
(async () => {
  if (process.env.DATABASE_URL) {
    try {
      const originalUrl = process.env.DATABASE_URL;

      // Parse without logging password
      const url = new URL(originalUrl);
      const hostname = url.hostname;
      const port = url.port || "5432";

      console.log(`[BOOTSTRAP] Original DATABASE_URL hostname: ${hostname}:${port}`);

      // Skip if already an IPv4 address
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        console.log(`[BOOTSTRAP] ✓ Already using IPv4 address: ${hostname}`);
      } else {
        console.log(`[BOOTSTRAP] Resolving ${hostname} to IPv4...`);

        // Use dns.lookup with family: 4 for maximum reliability
        // This forces IPv4 resolution even if AAAA records exist
        const { address, family } = await dnsPromises.lookup(hostname, { family: 4 });

        console.log(`[BOOTSTRAP] ✓ Resolved ${hostname} → ${address} (family: ${family})`);

        // Verify it's actually IPv4
        if (!/^\d+\.\d+\.\d+\.\d+$/.test(address)) {
          throw new Error(`Expected IPv4 address but got: ${address}`);
        }

        // Replace hostname with IPv4 in DATABASE_URL
        url.hostname = address;
        process.env.DATABASE_URL = url.toString();

        console.log(`[BOOTSTRAP] ✓ DATABASE_URL updated to use IPv4 address`);
        console.log(`[BOOTSTRAP] ✓ Connection will use: ${address}:${port}`);

        // Mark that bootstrap ran successfully
        process.env.BOOTSTRAP_IPV4_RESOLVED = "true";
      }
    } catch (error) {
      console.error(`[BOOTSTRAP] ✗ CRITICAL: Failed to resolve DATABASE_URL hostname`);
      console.error(`[BOOTSTRAP] ✗ Error: ${error.message}`);
      console.error(`[BOOTSTRAP] ✗ Will proceed with original DATABASE_URL - connections may fail!`);
      console.error(`[BOOTSTRAP] ✗ Check: 1) DNS reachable, 2) Hostname valid, 3) IPv4 records exist`);
    }
  } else {
    console.log(`[BOOTSTRAP] ⚠️  DATABASE_URL not set - database will be unavailable`);
  }

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                 Starting Application Server                  ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  // Now launch the actual server
  require("./dist/index.cjs");
})().catch(err => {
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║                   FATAL BOOTSTRAP ERROR                      ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");
  console.error(err);
  process.exit(1);
});
