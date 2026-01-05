const dns = require("node:dns");

// Support override via env (e.g., DNS_RESULT_ORDER=ipv6first node bootstrap.cjs)
const order = process.env.DNS_RESULT_ORDER || "ipv4first";
dns.setDefaultResultOrder(order);

console.log(`DNS order: ${order} (bootstrap)`);

// Now launch the actual server
require("./dist/index.cjs");
