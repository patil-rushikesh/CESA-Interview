"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Users, FileText, BarChart3, LogOut, Eye, Edit, Search, Download, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types
interface Student {
  id: string
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
}

interface TeamMarks {
  technical: number
  communication: number
  leadership: number
  problemSolving: number
  teamwork: number
  overall: number
  comments: string
}

interface Team {
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
}

interface User {
  id: string
  username: string
  role: "admin" | "panel"
  teamId?: string
  teamName?: string
}

interface Evaluation {
  _id: string
  studentId: string
  teamId: string
  technical: number
  communication: number
  leadership: number
  problemSolving: number
  teamwork: number
  overall: number
  comments: string
  evaluatedAt: string
}

export default function CESARecruitmentDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isMarkingDialogOpen, setIsMarkingDialogOpen] = useState(false)
  const [currentMarks, setCurrentMarks] = useState<TeamMarks>({
    technical: 0,
    communication: 0,
    leadership: 0,
    problemSolving: 0,
    teamwork: 0,
    overall: 0,
    comments: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data functions
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (currentUser?.role === "panel" && currentUser.teamId) {
        params.append("teamId", currentUser.teamId)
      } else if (selectedTeam !== "all") {
        params.append("teamId", selectedTeam)
      }
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sortBy", sortBy)

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
      } else {
        setError(data.error || "Failed to fetch students")
      }
    } catch (err) {
      setError("Failed to fetch students")
      console.error("Error fetching students:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams)
      } else {
        setError(data.error || "Failed to fetch teams")
      }
    } catch (err) {
      setError("Failed to fetch teams")
      console.error("Error fetching teams:", err)
    }
  }

  const fetchEvaluations = async () => {
    try {
      const response = await fetch("/api/evaluations")
      const data = await response.json()

      if (response.ok) {
        setEvaluations(data.evaluations)
      } else {
        setError(data.error || "Failed to fetch evaluations")
      }
    } catch (err) {
      setError("Failed to fetch evaluations")
      console.error("Error fetching evaluations:", err)
    }
  }

  // Load data when user changes or filters change
  useEffect(() => {
    if (currentUser) {
      fetchStudents()
      fetchTeams()
      fetchEvaluations()
    }
  }, [currentUser, selectedTeam, searchTerm, sortBy])

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("cesaUser") : null
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

  // Save user to sessionStorage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("cesaUser", JSON.stringify(currentUser))
    } else {
      sessionStorage.removeItem("cesaUser")
    }
  }, [currentUser])

  // Login component
  const LoginForm = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loginType, setLoginType] = useState<"admin" | "panel">("panel")
    const [loginLoading, setLoginLoading] = useState(false)

    const handleLogin = async () => {
      try {
        setLoginLoading(true)
        setError(null)

        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, loginType }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentUser(data.user)
          // sessionStorage is handled by useEffect above
        } else {
          setError(data.message || "Login failed")
        }
      } catch (err) {
        setError("Login failed. Please try again.")
        console.error("Login error:", err)
      } finally {
        setLoginLoading(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">CESA Recruitment 2025-26</CardTitle>
            <CardDescription>Interview Panel Dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="loginType">Login Type</Label>
              <Select value={loginType} onValueChange={(value: "admin" | "panel") => setLoginType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="panel">Team Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{loginType === "admin" ? "Username" : "Team Name"}</Label>
              <Input
                id="username"
                placeholder={loginType === "admin" ? "Enter username" : "Enter team name"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate weighted score
  const calculateWeightedScore = (marks: TeamMarks, teamId: string): number => {
    const team = teams.find((t) => t.id === teamId)
    if (!team) return 0

    const criteria = team.markingCriteria
    const totalScore =
      (marks.technical * criteria.technical.weight) / 100 +
      (marks.communication * criteria.communication.weight) / 100 +
      (marks.leadership * criteria.leadership.weight) / 100 +
      (marks.problemSolving * criteria.problemSolving.weight) / 100 +
      (marks.teamwork * criteria.teamwork.weight) / 100

    return Math.round(totalScore * 10) / 10
  }

  // Get student evaluation for a specific team
  const getStudentEvaluationForTeam = (studentId: string, teamId: string): Evaluation | null => {
    return evaluations.find((evaluation) => evaluation.studentId === studentId && evaluation.teamId === teamId) || null
  }

  // Handle marking submission
  const handleMarkingSubmit = async () => {
    if (!selectedStudent || !currentUser?.teamId || !currentUser.id) return

    try {
      setLoading(true)

      const updatedMarks = {
        ...currentMarks,
        overall: calculateWeightedScore(currentMarks, currentUser.teamId),
      }

      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          teamId: currentUser.teamId,
          marks: updatedMarks,
          evaluatorId: currentUser.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh evaluations
        await fetchEvaluations()
        setIsMarkingDialogOpen(false)
        setSelectedStudent(null)
      } else {
        setError(data.error || "Failed to save evaluation")
      }
    } catch (err) {
      setError("Failed to save evaluation")
      console.error("Error saving evaluation:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">CESA Recruitment Dashboard</h1>
              <Badge variant="outline">{currentUser.role === "admin" ? "Admin" : currentUser.teamName}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentUser(null)
                  sessionStorage.removeItem("cesaUser")
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <Label htmlFor="search">Search Students</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, PRN, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {currentUser.role === "admin" && (
                    <div className="min-w-48">
                      <Label htmlFor="team-filter">Filter by Team</Label>
                      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Teams</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="min-w-48">
                    <Label htmlFor="sort">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="prn">PRN Number</SelectItem>
                        <SelectItem value="cgpa">CGPA</SelectItem>
                        <SelectItem value="submission">Submission Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Students Table */}
                <div className="rounded-md border">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading students...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>PRN</TableHead>
                          <TableHead>Division</TableHead>
                          <TableHead>CGPA</TableHead>
                          <TableHead>Teams Applied</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const evaluation = currentUser.teamId
                            ? getStudentEvaluationForTeam(student.id, currentUser.teamId)
                            : null

                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {student.firstName[0]}
                                      {student.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">{student.prnNumber}</TableCell>
                              <TableCell>{student.division}</TableCell>
                              <TableCell>
                                <Badge variant={Number.parseFloat(student.fyCgpa) >= 8 ? "default" : "secondary"}>
                                  {student.fyCgpa}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {student.teamsApplied.slice(0, 2).map((team, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {team}
                                    </Badge>
                                  ))}
                                  {student.teamsApplied.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{student.teamsApplied.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {evaluation ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Evaluated ({evaluation.overall}/10)
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {currentUser.role === "panel" && currentUser.teamId && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStudent(student)
                                        setCurrentMarks(
                                          evaluation
                                            ? {
                                              technical: evaluation.technical,
                                              communication: evaluation.communication,
                                              leadership: evaluation.leadership,
                                              problemSolving: evaluation.problemSolving,
                                              teamwork: evaluation.teamwork,
                                              overall: evaluation.overall,
                                              comments: evaluation.comments,
                                            }
                                            : {
                                              technical: 0,
                                              communication: 0,
                                              leadership: 0,
                                              problemSolving: 0,
                                              teamwork: 0,
                                              overall: 0,
                                              comments: "",
                                            },
                                        )
                                        setIsMarkingDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{evaluations.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg CGPA</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.length > 0
                      ? (
                        students.reduce((sum, s) => sum + Number.parseFloat(s.fyCgpa || "0"), 0) / students.length
                      ).toFixed(2)
                      : "0.00"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max Students:</span>
                        <span className="font-medium">{team.maxStudents}</span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Marking Criteria:</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Technical:</span>
                            <span>{team.markingCriteria.technical.weight}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Communication:</span>
                            <span>{team.markingCriteria.communication.weight}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Leadership:</span>
                            <span>{team.markingCriteria.leadership.weight}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Problem Solving:</span>
                            <span>{team.markingCriteria.problemSolving.weight}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Teamwork:</span>
                            <span>{team.markingCriteria.teamwork.weight}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Reports
                </CardTitle>
                <CardDescription>Generate and download various reports for the recruitment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Student Applications Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Evaluation Summary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Users className="h-6 w-6 mb-2" />
                    Team-wise Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Final Selection List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent && !isMarkingDialogOpen} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
            <DialogDescription>
              PRN: {selectedStudent?.prnNumber} | Division: {selectedStudent?.division}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.whatsappNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">FY CGPA</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.fyCgpa}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">FY Attendance</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.fyAttendance}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Teams Applied</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedStudent.teamsApplied.map((team, index) => (
                    <Badge key={index} variant="outline">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">About Yourself</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedStudent.aboutYourself}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Accomplishment</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedStudent.accomplishment}</p>
              </div>

              {/* Show evaluations for this student */}
              {evaluations.filter((evaluation) => evaluation.studentId === selectedStudent.id).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Evaluation Results</Label>
                  <div className="mt-2 space-y-2">
                    {evaluations
                      .filter((evaluation) => evaluation.studentId === selectedStudent.id)
                      .map((evaluation) => {
                        const team = teams.find((t) => t.id === evaluation.teamId)
                        return (
                          <Card key={evaluation._id}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{team?.name}</h4>
                                <Badge className="bg-green-100 text-green-800">{evaluation.overall}/10</Badge>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-xs">
                                <div>Tech: {evaluation.technical}</div>
                                <div>Comm: {evaluation.communication}</div>
                                <div>Lead: {evaluation.leadership}</div>
                                <div>Problem: {evaluation.problemSolving}</div>
                                <div>Team: {evaluation.teamwork}</div>
                              </div>
                              {evaluation.comments && (
                                <p className="text-xs text-gray-600 mt-2">{evaluation.comments}</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Marking Dialog */}
      <Dialog open={isMarkingDialogOpen} onOpenChange={setIsMarkingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Evaluate {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
            <DialogDescription>{currentUser?.teamName} - Rate each criterion from 0-10</DialogDescription>
          </DialogHeader>

          {selectedStudent && currentUser?.teamId && (
            <div className="space-y-4">
              {Object.entries(teams.find((t) => t.id === currentUser.teamId)?.markingCriteria || {}).map(
                ([criterion, config]) => (
                  <div key={criterion} className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="capitalize">{criterion.replace(/([A-Z])/g, " $1")}</Label>
                      <span className="text-sm text-gray-500">Weight: {config.weight}%</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={currentMarks[criterion as keyof TeamMarks] as number}
                      onChange={(e) =>
                        setCurrentMarks((prev) => ({
                          ...prev,
                          [criterion]: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ),
              )}

              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  placeholder="Add your evaluation comments..."
                  value={currentMarks.comments}
                  onChange={(e) =>
                    setCurrentMarks((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                />
              </div>


              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Weighted Score: </span>
                  <span className="font-bold">{calculateWeightedScore(currentMarks, currentUser.teamId)}/10</span>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsMarkingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkingSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Evaluation"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
