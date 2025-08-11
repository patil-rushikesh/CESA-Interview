import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

// Ensure this file is at: d:\cesa\app\api\auth\change-password\route.ts
// Next.js 13+ API routes require the filename to be 'route.ts' inside a folder named after the route.

export const dynamic = "force-dynamic" // Ensure route is dynamic for Next.js

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Defensive: handle both string and object payloads
    const username = typeof body.username === "string" ? body.username.trim() : ""
    const oldPassword = typeof body.oldPassword === "string" ? body.oldPassword : ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection("users")
    // Try both username and email for flexibility
    const user = await users.findOne({
      $or: [{ username }, { email: username }]
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Defensive: user.password may be undefined/null
    if (!user.password) {
      return NextResponse.json({ success: false, error: "User has no password set" }, { status: 400 })
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 401 })
    }

    // Prevent setting the same password
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      return NextResponse.json({ success: false, error: "New password must be different from old password" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await users.updateOne({ _id: user._id }, { $set: { password: hashed } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
