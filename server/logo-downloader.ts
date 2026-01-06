import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/svg+xml"]);
const MAX_BYTES = 2 * 1024 * 1024;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function extensionFromMime(mime: string, fallback = "png"): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/png") return "png";
  return fallback;
}

export async function downloadLogoForAlias(params: {
  userId: string;
  aliasDesc: string;
  url: string;
  baseDir?: string;
}) {
  const response = await fetch(params.url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar logo (${response.status})`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "";
  if (!ALLOWED_MIME.has(contentType)) {
    throw new Error(`Formato de logo nao permitido: ${contentType || "desconhecido"}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    throw new Error(`Logo excede limite de tamanho (${MAX_BYTES} bytes)`);
  }

  const baseDir = params.baseDir || path.join(process.cwd(), "public", "logos");
  const aliasSlug = slugify(params.aliasDesc) || "alias";
  const ext = extensionFromMime(contentType);
  const relativePath = path.join("logos", params.userId, `${aliasSlug}.${ext}`);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    logoLocalPath: `/${relativePath.replace(/\\\\/g, "/")}`,
    logoMimeType: contentType,
    sizeBytes: buffer.length
  };
}
