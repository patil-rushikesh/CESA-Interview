import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { username, oldPassword, newPassword } = await request.json()
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }


    const db = await getDatabase()
    const users = db.collection("users")
    const user = await users.findOne({ username })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    // console.log(user);
    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 401 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await users.updateOne({ username }, { $set: { passwordHash: hashed } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
