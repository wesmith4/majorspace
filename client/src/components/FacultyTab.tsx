import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import type { Faculty } from '@/types'

interface FacultyTabProps {
  faculty: Faculty[]
}

export function FacultyTab({ faculty }: FacultyTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
      {faculty.length === 0 ? (
        <p className="col-span-2 text-center text-muted-foreground py-8">
          No faculty information available.
        </p>
      ) : (
        faculty.map(member => (
          <Card key={member.id} className="overflow-hidden shadow-sm">
            <div className="flex">
              {member.imageUrl && (
                <div className="w-36 shrink-0">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4 flex-1">
                <div className="space-y-2">
                  <div>
                    {member.profileUrl ? (
                      <a
                        href={member.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        {member.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <h3 className="font-semibold">{member.name}</h3>
                    )}
                    {member.titles && (
                      <p className="text-sm text-muted-foreground">{member.titles}</p>
                    )}
                  </div>
                  <ul className="text-sm space-y-1">
                    {member.phone && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </li>
                    )}
                    {member.email && (
                      <li className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={`mailto:${member.email}`}
                          className="text-primary hover:underline"
                        >
                          {member.email}
                        </a>
                      </li>
                    )}
                    {member.office && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {member.office}
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
