import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Evaluation } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const teamId = searchParams.get("teamId")

    const db = await getDatabase()
    const evaluationsCollection = db.collection<Evaluation>("evaluations")

    const query: any = {}
    if (studentId) query.studentId = new ObjectId(studentId)
    if (teamId) query.teamId = teamId

    const evaluations = await evaluationsCollection.find(query).toArray()

    // Convert ObjectId to string for JSON serialization
    const evaluationsWithStringIds = evaluations.map((evaluation) => ({
      ...evaluation,
      _id: evaluation._id?.toString(),
      studentId: evaluation.studentId?.toString(),
      evaluatorId: evaluation.evaluatorId?.toString(),
    }))

    return NextResponse.json({ evaluations: evaluationsWithStringIds })
  } catch (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, teamId, marks, evaluatorId } = body

    const db = await getDatabase()
    const evaluationsCollection = db.collection<Evaluation>("evaluations")

    const evaluation: Evaluation = {
      studentId: new ObjectId(studentId),
      teamId,
      evaluatorId: new ObjectId(evaluatorId),
      technical: marks.technical,
      communication: marks.communication,
      leadership: marks.leadership,
      problemSolving: marks.problemSolving,
      teamwork: marks.teamwork,
      overall: marks.overall,
      comments: marks.comments,
      evaluatedAt: new Date(),
      updatedAt: new Date(),
    }

    // Upsert evaluation (update if exists, insert if not)
    const result = await evaluationsCollection.updateOne(
      { studentId: new ObjectId(studentId), teamId },
      { $set: evaluation },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Evaluation saved successfully",
      evaluationId: result.upsertedId?.toString() || "updated",
    })
  } catch (error) {
    console.error("Error saving evaluation:", error)
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 })
  }
}
