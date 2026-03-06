import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeedTab } from '@/components/FeedTab'
import { ReviewsTab } from '@/components/ReviewsTab'
import { FacultyTab } from '@/components/FacultyTab'
import { GraduationCap, LogIn, LogOut } from 'lucide-react'
import type { Department, Message, Review, Faculty } from '@/types'

interface SpaceProps {
  defaultTab?: string
}

export function Space({ defaultTab = 'feed' }: SpaceProps) {
  const { departmentName } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [department, setDepartment] = useState<Department | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    if (!user || !departmentName) return
    setLoading(true)

    Promise.all([
      fetch(`/api/spaces/${departmentName}`).then(r => r.json()),
      fetch(`/api/spaces/${departmentName}/reviews`).then(r => r.json()),
      fetch(`/api/spaces/${departmentName}/faculty`).then(r => r.json()),
    ])
      .then(([spaceData, reviewsData, facultyData]) => {
        setDepartment(spaceData.department)
        setMessages(spaceData.messages || [])
        setIsMember(spaceData.userBelongsToDepartment || false)
        setReviews(reviewsData.reviews || [])
        setFaculty(facultyData.faculty || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, departmentName])

  if (!user) {
    navigate('/')
    return null
  }

  const handleJoinLeave = async () => {
    const action = isMember ? 'leave' : 'join'
    await fetch(`/api/spaces/${departmentName}/${action}`, { method: 'POST' })
    setIsMember(!isMember)
  }

  const handleNewMessage = async (subject: string, messageBody: string, isQuestion: boolean) => {
    const res = await fetch(`/api/spaces/${departmentName}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, messageBody, isQuestion }),
    })
    if (res.ok) {
      const data = await fetch(`/api/spaces/${departmentName}`).then(r => r.json())
      setMessages(data.messages || [])
    }
  }

  const handleReply = async (messageId: number, messageBody: string) => {
    const res = await fetch(`/api/spaces/${departmentName}/messages/${messageId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageBody }),
    })
    if (res.ok) {
      const data = await fetch(`/api/spaces/${departmentName}`).then(r => r.json())
      setMessages(data.messages || [])
    }
  }

  const handleLike = async (messageId: number) => {
    await fetch(`/api/spaces/${departmentName}/messages/${messageId}/like`, { method: 'POST' })
    const data = await fetch(`/api/spaces/${departmentName}`).then(r => r.json())
    setMessages(data.messages || [])
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'feed') navigate(`/spaces/${departmentName}`)
    else if (value === 'reviews') navigate(`/spaces/${departmentName}/reviews`)
    else if (value === 'faculty') navigate(`/spaces/${departmentName}/faculty`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Department header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{department?.name || departmentName}</h1>
        <Button
          variant={isMember ? 'outline' : 'default'}
          size="sm"
          onClick={handleJoinLeave}
        >
          {isMember ? (
            <>
              <GraduationCap className="mr-1 h-4 w-4" />
              Member
              <LogOut className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              <LogIn className="mr-1 h-4 w-4" />
              Join {departmentName}
            </>
          )}
        </Button>
      </div>

      {isMember && (
        <Badge variant="secondary" className="mb-4">
          <GraduationCap className="mr-1 h-3 w-3" />
          Member of {departmentName}
        </Badge>
      )}

      {/* Tabs visible on mobile */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="md:hidden mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="feed" className="flex-1">Messages</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
          <TabsTrigger value="faculty" className="flex-1">Faculty</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {activeTab === 'feed' && (
        <FeedTab
          messages={messages}
          departmentName={departmentName!}
          onNewMessage={handleNewMessage}
          onReply={handleReply}
          onLike={handleLike}
        />
      )}
      {activeTab === 'reviews' && (
        <ReviewsTab reviews={reviews} departmentName={departmentName!} />
      )}
      {activeTab === 'faculty' && (
        <FacultyTab faculty={faculty} />
      )}
    </div>
  )
}
