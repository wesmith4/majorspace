export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  classYear: string
  availableAsMentor?: boolean
  verifiedAt?: string | null
}

export interface Department {
  id: number
  name: string
  departmentUrl: string
}

export interface Faculty {
  id: number
  name: string
  titles?: string
  phone?: string
  email?: string
  office?: string
  imageUrl?: string
  profileUrl?: string
}

export interface Course {
  id: number
  departmentId: number
  courseNumber: string
}

export interface Review {
  id: number
  userId: number
  courseId: number
  departmentId: number
  facultyId: number
  review: string
  description: string
  courseTitle: string
  rating: number
  semester?: string
  user?: User
  course?: Course
  faculty?: Faculty
}

export interface Message {
  id: number
  userId: number
  departmentId: number
  subject: string
  messageBody: string
  isQuestion: boolean
  parentMessageId?: number | null
  createdAt: string
  user?: User
  replies?: Message[]
  numLikes?: number
  numReplies?: number
}
