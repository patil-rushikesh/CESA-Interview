import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Student } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "firstName"

    const db = await getDatabase()
    const studentsCollection = db.collection<Student>("students")

    // Build query
    const query: any = {}

    if (teamId && teamId !== "all") {
      // Filter students whose teamsApplied array contains the teamId
      query.teamsApplied = teamId
      // Optionally, if you want to also filter by panelAssignments, you can use:
      // query.$or = [{ teamsApplied: teamId }, { panelAssignments: teamId }]
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { prnNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort
    let sort: any = {}
    switch (sortBy) {
      case "name":
        sort = { firstName: 1, lastName: 1 }
        break
      case "prn":
        sort = { prnNumber: 1 }
        break
      case "cgpa":
        sort = { fyCgpa: -1 }
        break
      case "submission":
        sort = { submissionTime: -1 }
        break
      default:
        sort = { firstName: 1 }
    }

    const students = await studentsCollection.find(query).sort(sort).toArray()

    // Convert ObjectId to string for JSON serialization
    const studentsWithStringIds = students.map((student) => ({
      ...student,
      id: student._id?.toString(),
      _id: student._id?.toString(),
    }))

    return NextResponse.json({ students: studentsWithStringIds })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase()
    const studentsCollection = db.collection<Student>("students")
    const body = await request.json()
    // Basic validation (add more as needed)
    if (!body.firstName || !body.lastName || !body.prnNumber) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    // Insert student
    const result = await studentsCollection.insertOne({
      ...body,
      submissionTime: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add student" }, { status: 500 })
  }
}
