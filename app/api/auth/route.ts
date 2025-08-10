import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password, loginType } = await request.json()

    if (!username || !password || !loginType) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const user = await authenticateUser(username, password, loginType)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user

    return NextResponse.json({
      success: true,
      user: {
        id: user._id?.toString(),
        username: user.username,
        role: user.role,
        teamId: user.teamId,
        teamName: user.teamName,
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}
