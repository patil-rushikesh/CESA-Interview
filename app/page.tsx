"use client"

import { useState, useEffect, useRef } from "react"
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
import { AlertCircle, Users, FileText, BarChart3, LogOut, Eye, Edit, Search, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogFooter } from "@/components/ui/dialog"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"
import { Key } from "react"

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
  // Remove markingTeamId for admin; admin will evaluate for selectedTeam
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

  // Change password states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null)

  // Add Student dialog state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [addStudentLoading, setAddStudentLoading] = useState(false)
  const [addStudentError, setAddStudentError] = useState<string | null>(null)
  const [addStudentSuccess, setAddStudentSuccess] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    division: "",
    prnNumber: "",
    whatsappNumber: "",
    email: "",
    fyCgpa: "",
    fyAttendance: "",
    teamsApplied: [] as string[],
    accomplishment: "",
    teamInfluence: "",
    submissionTime: "",
    panelAssignments: [],
  })

  // Edit Marking Criteria dialog state
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [editCriteria, setEditCriteria] = useState<any>(null)
  const [editCriteriaLoading, setEditCriteriaLoading] = useState(false)
  const [editCriteriaError, setEditCriteriaError] = useState<string | null>(null)
  const [editCriteriaSuccess, setEditCriteriaSuccess] = useState<string | null>(null)

  // Edit Student dialog state
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [editStudentLoading, setEditStudentLoading] = useState(false)
  const [editStudentError, setEditStudentError] = useState<string | null>(null)
  const [editStudentSuccess, setEditStudentSuccess] = useState<string | null>(null)

  // Ref for table scroll container (fix: useRef instead of assignment)
  const tableScrollRef = useRef<HTMLDivElement>(null)

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
                onChange={(e: { target: { value: any } }) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e: { target: { value: any } }) => setPassword(e.target.value)}
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
    const team = teams.find((t: { id: string }) => t.id === teamId)
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
    return evaluations.find((evaluation: { studentId: string; teamId: string }) => evaluation.studentId === studentId && evaluation.teamId === teamId) || null
  }

  // Handle marking submission
  const handleMarkingSubmit = async () => {
    if (!selectedStudent || !currentUser?.id) return;
    let teamId = currentUser.teamId;
    if (currentUser.role === "admin") {
      if (!selectedTeam || selectedTeam === "all") {
        setError("Please select a team for evaluation using the team filter.");
        return;
      }
      teamId = selectedTeam;
    }
    if (!teamId) return;
    try {
      setLoading(true);
      const updatedMarks = {
        ...currentMarks,
        overall: calculateWeightedScore(currentMarks, teamId),
      };
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          teamId,
          marks: updatedMarks,
          evaluatorId: currentUser.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchEvaluations();
        setIsMarkingDialogOpen(false);
        setSelectedStudent(null);
      } else {
        setError(data.error || "Failed to save evaluation");
      }
    } catch (err) {
      setError("Failed to save evaluation");
      console.error("Error saving evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setChangePasswordError(null)
    setChangePasswordSuccess(null)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setChangePasswordError("All fields are required.")
      return
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError("New passwords do not match.")
      return
    }
    setChangePasswordLoading(true)
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser?.username,
          oldPassword,
          newPassword,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setChangePasswordSuccess("Password changed successfully.")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setIsChangePasswordOpen(false), 1500)
      } else {
        setChangePasswordError(data.error || "Failed to change password.")
      }
    } catch (err) {
      setChangePasswordError("Failed to change password.")
    } finally {
      setChangePasswordLoading(false)
    }
  }

  // Add Student logic
  const handleAddStudent = async () => {
    setAddStudentError(null)
    setAddStudentSuccess(null)
    setAddStudentLoading(true)
    // Limit to max 3 teams
    if (newStudent.teamsApplied.length > 3) {
      setAddStudentError("You can apply for a maximum of 3 teams.")
      setAddStudentLoading(false)
      return
    }
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setAddStudentSuccess("Student added successfully.")
        setNewStudent({
          firstName: "",
          lastName: "",
          division: "",
          prnNumber: "",
          whatsappNumber: "",
          email: "",
          fyCgpa: "",
          fyAttendance: "",
          teamsApplied: [],
          accomplishment: "",
          teamInfluence: "",
          submissionTime: "",
          panelAssignments: [],
        })
        fetchStudents()
        setTimeout(() => setIsAddStudentOpen(false), 1200)
      } else {
        setAddStudentError(data.error || "Failed to add student.")
      }
    } catch {
      setAddStudentError("Failed to add student.")
    } finally {
      setAddStudentLoading(false)
    }
  }

  // Edit Marking Criteria logic
  const openEditCriteria = (team: Team) => {
    setEditTeam(team)
    setEditCriteria({ ...team.markingCriteria })
    setEditCriteriaError(null)
    setEditCriteriaSuccess(null)
  }
  const handleEditCriteriaSave = async () => {
    if (!editTeam) return
    setEditCriteriaLoading(true)
    setEditCriteriaError(null)
    setEditCriteriaSuccess(null)
    try {
      const response = await fetch(`/api/teams/${editTeam.id}/criteria`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markingCriteria: editCriteria }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setEditCriteriaSuccess("Marking criteria updated.")
        fetchTeams()
        setTimeout(() => setEditTeam(null), 1200)
      } else {
        setEditCriteriaError(data.error || "Failed to update criteria.")
      }
    } catch {
      setEditCriteriaError("Failed to update criteria.")
    } finally {
      setEditCriteriaLoading(false)
    }
  }

  // Handle edit student save
  const handleEditStudentSave = async () => {
    if (!editStudent) return
    setEditStudentError(null)
    setEditStudentSuccess(null)
    setEditStudentLoading(true)
    try {
      const response = await fetch(`/api/students/${editStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editStudent),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setEditStudentSuccess("Student updated successfully.")
        fetchStudents()
        setTimeout(() => {
          setIsEditStudentOpen(false)
          setEditStudent(null)
        }, 1200)
      } else {
        setEditStudentError(data.error || "Failed to update student.")
      }
    } catch {
      setEditStudentError("Failed to update student.")
    } finally {
      setEditStudentLoading(false)
    }
  }

  // Login component
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
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button> */}
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
            {/* Admin Add Student Button */}
            {currentUser.role === "admin" && (
              <div className="mb-4 flex justify-end">
                <Button onClick={() => setIsAddStudentOpen(true)}>Add Student</Button>
              </div>
            )}
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
                        onChange={(e: { target: { value: any } }) => setSearchTerm(e.target.value)}
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
                          {teams.map((team: { id: any; name: any }) => (
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
                <div className="relative">
                  {/* Fixed horizontal scroll buttons (now absolute to table container) */}
                  <button
                    type="button"
                    aria-label="Scroll table left"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white border rounded-full shadow p-1"
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={() => {
                      if (tableScrollRef.current) {
                        tableScrollRef.current.scrollBy({ left: -150, behavior: "smooth" })
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll table right"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white border rounded-full shadow p-1"
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={() => {
                      if (tableScrollRef.current) {
                        tableScrollRef.current.scrollBy({ left: 150, behavior: "smooth" })
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div
                    ref={tableScrollRef}
                    className="rounded-md border overflow-x-auto"
                    style={{ maxWidth: "100%" }}
                    onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
                      if (e.ctrlKey) {
                        e.preventDefault()
                        const container = e.currentTarget
                        container.scrollLeft += e.deltaY
                      }
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading students...</span>
                      </div>
                    ) : (
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>PRN</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>CGPA</TableHead>
                            <TableHead>Teams Applied</TableHead>
                            {currentUser.role === "admin" && (
                              <TableHead>Evaluation Status</TableHead>
                            )}
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
                                    {student.teamsApplied.slice(0, 2).map((teamId: any, index: any) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {teams.find((t: { id: any }) => t.id === teamId)?.name || teamId}
                                      </Badge>
                                    ))}
                                    {student.teamsApplied.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{student.teamsApplied.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                {/* Show all evaluations for admin */}
                                {currentUser.role === "admin" && (
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {student.teamsApplied.map((teamId: Key | null | undefined) => {
                                        const team = teams.find((t: { id: any }) => t.id === teamId)
                                        const evaln = evaluations.find(
                                          (                                          e: { studentId: any; teamId: any }) => e.studentId === student.id && e.teamId === teamId
                                        )
                                        return (
                                          <div key={teamId} className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                              {team?.name || teamId}
                                            </Badge>
                                            {evaln ? (
                                              <Badge className="bg-green-100 text-green-800 text-xs">
                                                Evaluated ({evaln.overall}/10)
                                              </Badge>
                                            ) : (
                                              <Badge variant="secondary" className="text-xs">
                                                Pending
                                              </Badge>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </TableCell>
                                )}
                                {/* For panel, show only their own team status */}
                                <TableCell>
                                  {currentUser.role === "panel" && currentUser.teamId ? (
                                    (() => {
                                      const evaln = evaluations.find(
                                        (                                        e: { studentId: any; teamId: any }) => e.studentId === student.id && e.teamId === currentUser.teamId
                                      )
                                      return evaln ? (
                                        <Badge className="bg-green-100 text-green-800">
                                          Evaluated ({evaln.overall}/10)
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                      )
                                    })()
                                  ) : (
                                    <span className="text-xs text-gray-500">-</span>
                                  )}
                                </TableCell>
                                {/* ...existing Actions cell... */}
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {currentUser.role === "admin" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setEditStudent({ ...student })
                                          setIsEditStudentOpen(true)
                                          setEditStudentError(null)
                                          setEditStudentSuccess(null)
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {currentUser.role === "panel" && currentUser.teamId && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedStudent(student)
                                          const evaluation = evaluations.find(
                                            (e: { studentId: any; teamId: any }) => e.studentId === student.id && e.teamId === currentUser.teamId
                                          )
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
                        students.reduce((sum: number, s: { fyCgpa: any }) => sum + Number.parseFloat(s.fyCgpa || "0"), 0) / students.length
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
              {teams.map((team: Team) => (
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
                      {/* Admin Edit Criteria Button */}
                      {currentUser.role === "admin" && (
                        <Button size="sm" variant="outline" onClick={() => openEditCriteria(team)}>
                          Edit Marking Criteria
                        </Button>
                      )}
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
              {/* Responsive grid for student info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedStudent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedStudent.whatsappNumber}</p>
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
                  {selectedStudent.teamsApplied.map((team: any, index: any) => (
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
              {evaluations.filter((evaluation: { studentId: any }) => evaluation.studentId === selectedStudent.id).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Evaluation Results</Label>
                  <div className="mt-2 space-y-2">
                    {evaluations
                      .filter((evaluation: { studentId: any }) => evaluation.studentId === selectedStudent.id)
                      .map((evaluation: { teamId: any; _id: any; overall: any; technical: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; communication: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; leadership: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; problemSolving: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; teamwork: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; comments: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => {
                        const team = teams.find((t: { id: any }) => t.id === evaluation.teamId)
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
            <DialogDescription>
              {currentUser?.role === "admin"
                ? `${teams.find(t => t.id === selectedTeam)?.name || "Select a team using the filter above"} - Rate each criterion from 0-10`
                : `${currentUser?.teamName} - Rate each criterion from 0-10`}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && ((currentUser?.role === "panel" && currentUser?.teamId) || currentUser?.role === "admin") && (
            <div className="space-y-4">
              {Object.entries(teams.find((t: { id: any }) => t.id === currentUser.teamId)?.markingCriteria || {}).map(
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
                      onChange={(e: { target: { value: string } }) =>
                        setCurrentMarks((prev: any) => ({
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCurrentMarks((prev: TeamMarks) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Weighted Score: </span>
                  <span className="font-bold">{calculateWeightedScore(currentMarks, currentUser.role === "admin" ? selectedTeam : currentUser.teamId as string)}/10</span>
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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {changePasswordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{changePasswordError}</AlertDescription>
              </Alert>
            )}
            {changePasswordSuccess && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{changePasswordSuccess}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e: { target: { value: any } }) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e: { target: { value: any } }) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e: { target: { value: any } }) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {addStudentError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{addStudentError}</AlertDescription>
              </Alert>
            )}
            {addStudentSuccess && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{addStudentSuccess}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <Input value={newStudent.firstName} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, firstName: e.target.value }))} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={newStudent.lastName} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, lastName: e.target.value }))} />
              </div>
              <div>
                <Label>Division</Label>
                <Input value={newStudent.division} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, division: e.target.value }))} />
              </div>
              <div>
                <Label>PRN Number</Label>
                <Input value={newStudent.prnNumber} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, prnNumber: e.target.value }))} />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input value={newStudent.whatsappNumber} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, whatsappNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={newStudent.email} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <Label>FY CGPA</Label>
                <Input value={newStudent.fyCgpa} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, fyCgpa: e.target.value }))} />
              </div>
              <div>
                <Label>FY Attendance</Label>
                <Input value={newStudent.fyAttendance} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, fyAttendance: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Teams Applied (max 3)</Label>
                <div className="border rounded px-2 py-1">
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => (
                      <label key={team.id} className="flex items-center gap-1 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newStudent.teamsApplied.includes(team.id)}
                          disabled={
                            newStudent.teamsApplied.length >= 3 &&
                            !newStudent.teamsApplied.includes(team.id)
                          }
                          onChange={() => {
                            let updated = [...newStudent.teamsApplied]
                            if (updated.includes(team.id)) {
                              updated = updated.filter(t => t !== team.id)
                            } else if (updated.length < 3) {
                              updated.push(team.id)
                            }
                            setNewStudent((s: any) => ({ ...s, teamsApplied: updated }))
                          }}
                        />
                        {team.name}
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: {newStudent.teamsApplied.map((id: any) => teams.find((t: { id: any }) => t.id === id)?.name).filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Accomplishment</Label>
                <Textarea value={newStudent.accomplishment} onChange={(e: { target: { value: any } }) => setNewStudent((s: any) => ({ ...s, accomplishment: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddStudent} disabled={addStudentLoading}>
              {addStudentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog (Admin only) */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <div className="space-y-3">
              {editStudentError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editStudentError}</AlertDescription>
                </Alert>
              )}
              {editStudentSuccess && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editStudentSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>First Name</Label>
                  <Input value={editStudent.firstName} onChange={e => setEditStudent(s => s ? { ...s, firstName: e.target.value } : s)} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editStudent.lastName} onChange={e => setEditStudent(s => s ? { ...s, lastName: e.target.value } : s)} />
                </div>
                <div>
                  <Label>Division</Label>
                  <Input value={editStudent.division} onChange={e => setEditStudent(s => s ? { ...s, division: e.target.value } : s)} />
                </div>
                <div>
                  <Label>PRN Number</Label>
                  <Input value={editStudent.prnNumber} onChange={e => setEditStudent(s => s ? { ...s, prnNumber: e.target.value } : s)} />
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <Input value={editStudent.whatsappNumber} onChange={e => setEditStudent(s => s ? { ...s, whatsappNumber: e.target.value } : s)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editStudent.email} onChange={e => setEditStudent(s => s ? { ...s, email: e.target.value } : s)} />
                </div>
                <div>
                  <Label>FY CGPA</Label>
                  <Input value={editStudent.fyCgpa} onChange={e => setEditStudent(s => s ? { ...s, fyCgpa: e.target.value } : s)} />
                </div>
                <div>
                  <Label>FY Attendance</Label>
                  <Input value={editStudent.fyAttendance} onChange={e => setEditStudent(s => s ? { ...s, fyAttendance: e.target.value } : s)} />
                </div>
                <div className="col-span-2">
                  <Label>Teams Applied (max 3)</Label>
                  <div className="border rounded px-2 py-1">
                    <div className="flex flex-wrap gap-2">
                      {teams.map((team) => (
                        <label key={team.id} className="flex items-center gap-1 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editStudent.teamsApplied.includes(team.id)}
                            disabled={
                              editStudent.teamsApplied.length >= 3 &&
                              !editStudent.teamsApplied.includes(team.id)
                            }
                            onChange={() => {
                              let updated = [...editStudent.teamsApplied]
                              if (updated.includes(team.id)) {
                                updated = updated.filter(t => t !== team.id)
                              } else if (updated.length < 3) {
                                updated.push(team.id)
                              }
                              setEditStudent(s => s ? { ...s, teamsApplied: updated } : s)
                            }}
                          />
                          {team.name}
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Selected: {editStudent.teamsApplied.map((id: any) => teams.find((t: { id: any }) => t.id === id)?.name).filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Accomplishment</Label>
                  <Textarea value={editStudent.accomplishment} onChange={e => setEditStudent(s => s ? { ...s, accomplishment: e.target.value } : s)} />
                </div>
                <div className="col-span-2">
                  <Label>About Yourself</Label>
                  <Textarea value={editStudent.aboutYourself} onChange={e => setEditStudent(s => s ? { ...s, aboutYourself: e.target.value } : s)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditStudentSave} disabled={editStudentLoading}>
              {editStudentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}