import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'

export function Welcome() {
  const { user, unverified } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-davidson-red text-white rounded-2xl p-10 text-center shadow-xl">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-20 w-20" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            MajorSpace
          </h1>
          {user ? (
            <>
              <p className="text-lg text-white/90 mb-2">
                <em>Your</em> Davidson community, online.
              </p>
              <div className="w-16 h-px bg-white/40 mx-auto my-6" />
              <p className="text-white/80">
                Find an academic space using the department selector above!
              </p>
            </>
          ) : unverified ? (
            <>
              <p className="text-lg text-white/90 mb-4">
                Check your email for a verification link.
              </p>
              <p className="text-sm text-white/70">
                A verification email has been sent. Please check your inbox and click the link to verify your account.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-white/90">
                a <span className="text-xl font-bold">Davidson</span> community.
              </p>
              <p className="text-white/80 mb-6">Powered by Students.</p>
              <div className="w-16 h-px bg-white/40 mx-auto my-6" />
              <p className="text-white/80 mb-6">New to MajorSpace?</p>
              <Link to="/sign-up">
                <Button size="lg" className="bg-white text-davidson-red hover:bg-white/90 font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
