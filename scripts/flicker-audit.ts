import fs from "node:fs";
import path from "node:path";

type Pattern = { id: string; re: RegExp };

const PATTERNS: Pattern[] = [
  { id: "transition-all", re: /\btransition-all\b/g },
  { id: "backdrop-blur*", re: /\bbackdrop-blur(?:-\w+)?\b/g },
  { id: "transition-transform", re: /\btransition-transform\b/g },
  { id: "hover:border-*", re: /\bhover:border-[\w/-]+\b/g },
  { id: "hover:scale", re: /\bhover:scale-[\w.]+\b/g },
  { id: "hover:translate", re: /\bhover:-?translate-[xy]-[\w.]+\b/g },
  { id: "sticky", re: /\bsticky\b/g },
];

type Hit = { file: string; line: number; pattern: string; excerpt: string };

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

function isSourceFile(file: string): boolean {
  return (
    (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) &&
    !file.includes(`${path.sep}node_modules${path.sep}`) &&
    !file.includes(`${path.sep}.next${path.sep}`)
  );
}

function scanFile(file: string): Hit[] {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const hits: Hit[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        hits.push({ file, line: i + 1, pattern: p.id, excerpt: line.trim().slice(0, 200) });
      }
      p.re.lastIndex = 0;
    }
    if (/\bsticky\b/.test(line) && /\bbackdrop-blur(?:-\w+)?\b/.test(line)) {
      hits.push({ file, line: i + 1, pattern: "sticky+blur", excerpt: line.trim().slice(0, 200) });
    }
  }
  return hits;
}

const srcRoot = path.resolve("src");
const files = walk(srcRoot).filter(isSourceFile);
const hits = files.flatMap(scanFile);

const byPattern = new Map<string, number>();
const byFile = new Map<string, number>();

for (const h of hits) {
  byPattern.set(h.pattern, (byPattern.get(h.pattern) ?? 0) + 1);
  byFile.set(h.file, (byFile.get(h.file) ?? 0) + 1);
}

const topFiles = Array.from(byFile.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([file, count]) => ({ file: path.relative(process.cwd(), file), count }));

const lines: string[] = [];
lines.push("# Flicker Audit Report");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Totals (all src/)");
lines.push("");
for (const [pattern, count] of Array.from(byPattern.entries()).sort((a, b) => b[1] - a[1])) {
  lines.push(`- ${pattern}: ${count}`);
}
lines.push("");
lines.push("## Top 10 files by hotspot count");
lines.push("");
for (const f of topFiles) {
  lines.push(`- ${f.count}\t${f.file}`);
}
lines.push("");
lines.push("## Occurrences (file:line)");
lines.push("");
for (const h of hits) {
  const rel = path.relative(process.cwd(), h.file);
  lines.push(`- ${h.pattern}\t${rel}:${h.line}\t${h.excerpt}`);
}

fs.mkdirSync(path.resolve("docs"), { recursive: true });
fs.writeFileSync(path.resolve("docs/flicker-audit.md"), lines.join("\n") + "\n", "utf8");

// eslint-disable-next-line no-console
console.log(`Wrote docs/flicker-audit.md with ${hits.length} total hits.`);

