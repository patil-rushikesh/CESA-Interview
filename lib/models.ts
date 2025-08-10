import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  username: string
  passwordHash: string
  role: "admin" | "panel"
  teamId?: string
  teamName?: string
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  _id?: ObjectId
  id: string
  name: string
  description: string
  maxStudents: number
  markingCriteria: {
    technical: { weight: number; maxMarks: number }
    communication: { weight: number; maxMarks: number }
    leadership: { weight: number; maxMarks: number }
    problemSolving: { weight: number; maxMarks: number }
    teamwork: { weight: number; maxMarks: number }
  }
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  _id?: ObjectId
  firstName: string
  lastName: string
  division: string
  prnNumber: string
  whatsappNumber: string
  email: string
  fyCgpa: string
  fyAttendance: string
  teamsApplied: string[]
  aboutYourself: string
  accomplishment: string
  teamInfluence: string
  submissionTime: string
  panelAssignments: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Evaluation {
  _id?: ObjectId
  studentId: ObjectId
  teamId: string
  evaluatorId: ObjectId
  technical: number
  communication: number
  leadership: number
  problemSolving: number
  teamwork: number
  overall: number
  comments: string
  evaluatedAt: Date
  updatedAt: Date
}
