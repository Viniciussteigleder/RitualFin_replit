const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");

// Support override via env (e.g., DNS_RESULT_ORDER=ipv6first node bootstrap.cjs)
const order = process.env.DNS_RESULT_ORDER || "ipv4first";
dns.setDefaultResultOrder(order);

console.log(`DNS order: ${order} (bootstrap)`);

// Pre-resolve DATABASE_URL hostname to IPv4 and inject into environment
// This ensures the PostgreSQL pool uses IPv4 address directly
(async () => {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      const hostname = url.hostname;

      // Skip if already an IPv4 address
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        console.log(`✓ DATABASE_URL already uses IPv4: ${hostname}`);
      } else {
        // Resolve to IPv4 only (A records)
        const addresses = await dnsPromises.resolve4(hostname);
        if (addresses && addresses.length > 0) {
          const ipv4 = addresses[0];
          console.log(`✓ Resolved ${hostname} → ${ipv4}`);

          // Replace hostname with IPv4 in DATABASE_URL
          url.hostname = ipv4;
          process.env.DATABASE_URL = url.toString();
          console.log(`✓ DATABASE_URL updated to use IPv4 address`);
        } else {
          console.warn(`⚠️  No IPv4 address found for ${hostname}`);
        }
      }
    } catch (error) {
      console.error(`✗ Failed to resolve DATABASE_URL hostname: ${error.message}`);
      console.error(`  Will proceed with original DATABASE_URL`);
    }
  }

  // Now launch the actual server
  require("./dist/index.cjs");
})().catch(err => {
  console.error("Fatal error in bootstrap:", err);
  process.exit(1);
});
