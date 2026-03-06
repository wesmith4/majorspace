import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Feather, Star } from 'lucide-react'
import type { Review } from '@/types'

interface ReviewsTabProps {
  reviews: Review[]
  departmentName: string
}

export function ReviewsTab({ reviews, departmentName }: ReviewsTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Link to="/new-review">
          <Button size="lg">
            <Feather className="mr-2 h-4 w-4" />
            Write a Course Review
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="max-w-3xl mx-auto space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet for {departmentName}. Be the first to write one!
          </p>
        ) : (
          reviews.map(review => (
            <Card key={review.id} className="shadow-sm">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">
                  <span className="font-bold">{review.course?.courseNumber}</span>
                  {': '}
                  <em>{review.courseTitle}</em>
                  {review.faculty && ` - ${review.faculty.name}`}
                  {review.semester && (
                    <span className="text-muted-foreground">, {review.semester}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{review.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Review</h4>
                  <p className="text-sm text-muted-foreground">{review.review}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-davidson-red fill-davidson-red" />
                  <Badge variant="secondary" className="font-semibold">
                    {review.rating}/10
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
