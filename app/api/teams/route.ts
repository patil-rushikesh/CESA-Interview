import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Team } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const teamsCollection = db.collection<Team>("teams")

    const teams = await teamsCollection.find({}).toArray()

    // Convert ObjectId to string for JSON serialization
    const teamsWithStringIds = teams.map((team) => ({
      ...team,
      _id: team._id?.toString(),
    }))

    return NextResponse.json({ teams: teamsWithStringIds })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
