import fs from "node:fs";
import path from "node:path";

type Finding = { file: string; line: number; match: string };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isCodeFile(file: string): boolean {
  return (
    file.endsWith(".ts") ||
    file.endsWith(".tsx") ||
    file.endsWith(".js") ||
    file.endsWith(".jsx") ||
    file.endsWith(".css")
  );
}

function scanFile(file: string): Finding[] {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const findings: Finding[] = [];

  const forbidden = [
    { re: /\btransition-all\b/, label: "transition-all" },
    { re: /\bbackdrop-blur(-\w+)?\b/, label: "backdrop-blur*" },
    { re: /\btransition\s*:\s*all\b/, label: "transition: all" },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const f of forbidden) {
      if (f.re.test(line)) findings.push({ file, line: i + 1, match: f.label });
    }

    if (/\b(sticky|fixed)\b/.test(line) && /\bbackdrop-blur(-\w+)?\b/.test(line)) {
      findings.push({ file, line: i + 1, match: "sticky/fixed + backdrop-blur*" });
    }
  }

  return findings;
}

const roots = ["src"];

const findings: Finding[] = [];
for (const root of roots) {
  const abs = path.resolve(root);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    if (!isCodeFile(file)) continue;
    findings.push(...scanFile(file));
  }
}

if (findings.length) {
  // eslint-disable-next-line no-console
  console.error("UI perf guard failed. Remove these patterns from critical paths:");
  for (const f of findings) {
    // eslint-disable-next-line no-console
    console.error(`- ${path.relative(process.cwd(), f.file)}:${f.line}  ${f.match}`);
  }
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("UI perf guard: OK");
