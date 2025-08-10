import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"
import type { User } from "./models"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(
  username: string,
  password: string,
  loginType: "admin" | "panel",
): Promise<User | null> {
  const db = await getDatabase()
  const usersCollection = db.collection<User>("users")

  const user = await usersCollection.findOne({
    username: username.toLowerCase(),
    role: loginType,
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  return user
}
