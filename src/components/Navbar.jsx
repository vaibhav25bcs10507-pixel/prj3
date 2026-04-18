import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Zap, LayoutDashboard, BookOpen } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navLink = (to, label, Icon) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all no-underline
          ${active
            ? 'bg-indigo-500/15 text-indigo-300'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
          }`}
      >
        <Icon size={15} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline group">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">QuizVault</span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                {navLink('/', 'Dashboard', LayoutDashboard)}
                {navLink('/quiz', 'Quiz', BookOpen)}

                <div className="w-px h-5 bg-zinc-800 mx-1" />

                <span className="text-xs text-zinc-600 hidden md:inline max-w-[160px] truncate">
                  {user.email}
                </span>

                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all no-underline"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-colors no-underline shadow-lg shadow-indigo-500/20"
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
