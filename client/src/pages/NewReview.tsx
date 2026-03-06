import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Department, Faculty, Course } from '@/types'

export function NewReview() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [departments, setDepartments] = useState<Department[]>([])
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [department, setDepartment] = useState('')
  const [faculty, setFaculty] = useState('')
  const [courseNumber, setCourseNumber] = useState('')
  const [semester, setSemester] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [description, setDescription] = useState('')
  const [review, setReview] = useState('')
  const [rating, setRating] = useState([5])

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    Promise.all([
      fetch('/api/departments').then(r => r.json()),
      fetch('/api/faculty').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
    ])
      .then(([depts, facs, crses]) => {
        setDepartments(depts)
        setFacultyList(facs)
        setCourses(crses)
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (courseNumber.includes(' ')) {
      setError('Course number cannot have a space. Use format like "ECO101".')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          faculty,
          courseNumber,
          semester,
          courseTitle,
          description,
          review,
          rating: rating[0],
        }),
      })
      if (res.ok) {
        navigate('/')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit review.')
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">New Course Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            {/* Course Information */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Professor / Faculty Member</Label>
                  <Select value={faculty} onValueChange={setFaculty} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyList.map(f => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Course Number</Label>
                  <Input
                    value={courseNumber}
                    onChange={e => setCourseNumber(e.target.value)}
                    placeholder='e.g. "ECO101"'
                    list="courseList"
                    required
                  />
                  <datalist id="courseList">
                    {courses.map(c => (
                      <option key={c.id} value={c.courseNumber} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    placeholder='e.g. "Fall 2024"'
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    placeholder='e.g. "Intro Economics"'
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Review Content */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Your Review</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Description</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Your objective description of the course (structure, assignments, lectures, etc.)"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Review</Label>
                  <Textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Your subjective review of the course"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-4">0</span>
                    <Slider
                      value={rating}
                      onValueChange={setRating}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-6">10</span>
                  </div>
                  <p className="text-center text-2xl font-bold text-primary">{rating[0]}/10</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
