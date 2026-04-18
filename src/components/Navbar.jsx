import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, BookOpen, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white no-underline">
            <BookOpen size={22} className="text-indigo-400" />
            <span>QuizVault</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white no-underline transition-colors"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/quiz"
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white no-underline transition-colors"
                >
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">Quiz</span>
                </Link>
                <div className="h-5 w-px bg-slate-700" />
                <span className="text-xs text-slate-500 hidden md:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-white no-underline transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md no-underline transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
