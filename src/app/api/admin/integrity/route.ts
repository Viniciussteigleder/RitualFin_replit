import { NextResponse } from "next/server";
import { auditDataIntegrity, fixDataIntegrityIssues } from "@/lib/actions/categorization";

/**
 * GET /api/admin/integrity - Run data integrity audit
 * POST /api/admin/integrity - Fix data integrity issues
 */

export async function GET() {
  try {
    const result = await auditDataIntegrity();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Audit failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await fixDataIntegrityIssues();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Fix failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
