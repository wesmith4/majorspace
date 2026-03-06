import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navbar } from '@/components/Navbar'
import { Welcome } from '@/pages/Welcome'
import { SignUp } from '@/pages/SignUp'
import { SignIn } from '@/pages/SignIn'
import { Space } from '@/pages/Space'
import { NewReview } from '@/pages/NewReview'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/spaces/:departmentName" element={<Space defaultTab="feed" />} />
              <Route path="/spaces/:departmentName/reviews" element={<Space defaultTab="reviews" />} />
              <Route path="/spaces/:departmentName/faculty" element={<Space defaultTab="faculty" />} />
              <Route path="/new-review" element={<NewReview />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
