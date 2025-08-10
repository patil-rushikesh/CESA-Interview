import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function PUT(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const { teamId } = params
    const { markingCriteria } = await request.json()
    if (!teamId || !markingCriteria) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 })
    }
    const db = await getDatabase()
    const teams = db.collection("teams")
    await teams.updateOne({ id: teamId }, { $set: { markingCriteria } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update criteria" }, { status: 500 })
  }
}
