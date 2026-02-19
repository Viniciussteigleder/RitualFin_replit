import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, id))
    .limit(1);

  if (!attachment || attachment.userId !== session.user.id) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!attachment.fileContent) {
    // If we migrate to S3 later, we might redirect here
    return new NextResponse("Content not found (might be external)", { status: 404 });
  }

  return new NextResponse(attachment.fileContent as any, {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Length": attachment.sizeBytes.toString(),
      "Cache-Control": "private, max-age=31536000",
    },
  });
}
