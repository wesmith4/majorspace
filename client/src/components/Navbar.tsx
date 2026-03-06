import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, LogOut, GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Department } from '@/types'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { departmentName } = useParams()
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    if (user) {
      fetch('/api/departments')
        .then(res => res.json())
        .then(data => setDepartments(data))
        .catch(() => {})
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-davidson-red text-white shadow-md">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-7 w-7" />
          <span className="font-bold text-lg tracking-tight">MajorSpace</span>
        </Link>

        {/* Department selector + nav tabs */}
        {user && (
          <div className="flex items-center gap-2 flex-1">
            <Select
              value={departmentName || ''}
              onValueChange={(val) => navigate(`/spaces/${val}`)}
            >
              <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/70 [&>svg]:text-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {departmentName && (
              <nav className="hidden md:flex items-center gap-1 ml-2">
                <Link to={`/spaces/${departmentName}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    Message Board
                  </Button>
                </Link>
                <Link to={`/spaces/${departmentName}/reviews`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    Course Reviews
                  </Button>
                </Link>
                <Link to={`/spaces/${departmentName}/faculty`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    Faculty
                  </Button>
                </Link>
              </nav>
            )}
          </div>
        )}

        {/* Right side: user actions */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white gap-2">
                  <User className="h-4 w-4" />
                  {user.firstName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="bg-white text-davidson-red hover:bg-white/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
