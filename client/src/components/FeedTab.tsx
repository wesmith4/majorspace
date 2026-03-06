import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Heart, MessageCircle, ChevronDown, ChevronUp, Feather } from 'lucide-react'
import type { Message } from '@/types'

interface FeedTabProps {
  messages: Message[]
  departmentName: string
  onNewMessage: (subject: string, messageBody: string, isQuestion: boolean) => Promise<void>
  onReply: (messageId: number, messageBody: string) => Promise<void>
  onLike: (messageId: number) => Promise<void>
}

export function FeedTab({ messages, departmentName, onNewMessage, onReply, onLike }: FeedTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [isQuestion, setIsQuestion] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())
  const [replyForms, setReplyForms] = useState<Set<number>>(new Set())
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({})

  const handleSubmit = async () => {
    if (!subject.trim() || !messageBody.trim()) return
    setSubmitting(true)
    await onNewMessage(subject, messageBody, isQuestion)
    setSubject('')
    setMessageBody('')
    setIsQuestion(false)
    setShowForm(false)
    setSubmitting(false)
  }

  const handleReply = async (messageId: number) => {
    const text = replyTexts[messageId]
    if (!text?.trim()) return
    await onReply(messageId, text)
    setReplyTexts(prev => ({ ...prev, [messageId]: '' }))
    setReplyForms(prev => {
      const next = new Set(prev)
      next.delete(messageId)
      return next
    })
  }

  const toggleReplies = (id: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleReplyForm = (id: number) => {
    setReplyForms(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Feather className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Write your message..."
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isQuestion}
                  onChange={e => setIsQuestion(e.target.checked)}
                  className="rounded"
                />
                This is a question
              </label>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No messages yet. Be the first to post!
          </p>
        ) : (
          messages.map(message => (
            <div key={message.id} className="space-y-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">
                        {message.user?.firstName} {message.user?.lastName}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {message.subject}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{message.messageBody}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLike(message.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      {message.numLikes || 0}
                    </Button>
                    {message.replies && message.replies.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(message.id)}
                        className="text-muted-foreground"
                      >
                        {expandedReplies.has(message.id) ? (
                          <ChevronUp className="mr-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="mr-1 h-4 w-4" />
                        )}
                        Replies ({message.numReplies || message.replies.length})
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplyForm(message.id)}
                      className="text-muted-foreground"
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reply form */}
              {replyForms.has(message.id) && (
                <div className="ml-8">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyTexts[message.id] || ''}
                        onChange={e =>
                          setReplyTexts(prev => ({ ...prev, [message.id]: e.target.value }))
                        }
                        rows={2}
                      />
                      <Button size="sm" onClick={() => handleReply(message.id)}>
                        Post Reply
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Replies */}
              {expandedReplies.has(message.id) && message.replies && (
                <div className="ml-8 space-y-2">
                  {message.replies.map(reply => (
                    <Card key={reply.id} className="shadow-none bg-muted/30">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <span className="font-semibold text-sm">
                          {reply.user?.firstName} {reply.user?.lastName}
                        </span>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <p className="text-sm">{reply.messageBody}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLike(reply.id)}
                            className="text-muted-foreground hover:text-primary h-7 px-2"
                          >
                            <Heart className="mr-1 h-3 w-3" />
                            {reply.numLikes || 0}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
