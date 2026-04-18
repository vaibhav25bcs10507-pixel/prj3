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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex gap-2 items-center no-underline group">
            <div className="flex justify-center items-center w-7 h-7 bg-indigo-500 rounded-lg shadow-lg transition-shadow shadow-indigo-500/30 group-hover:shadow-indigo-500/50">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">QuizVault</span>
          </Link>

          {/* Right */}
          <div className="flex gap-1 items-center">
            {user ? (
              <>
                {navLink('/', 'Dashboard', LayoutDashboard)}
                {pathname.startsWith('/quiz') && (
                  <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 select-none">
                    <BookOpen size={15} />
                    <span className="hidden sm:inline">Quiz</span>
                  </div>
                )}

                <div className="mx-1 w-px h-5 bg-zinc-800" />

                <span className="hidden text-xs md:inline text-zinc-600 max-w-[160px] truncate">
                  {user.email}
                </span>

                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="flex gap-1.5 items-center py-1.5 px-2.5 text-sm font-medium bg-transparent rounded-lg border-none transition-all cursor-pointer hover:text-red-400 text-zinc-500 hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-1.5 px-3 text-sm font-medium no-underline rounded-lg transition-all text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="py-1.5 px-3.5 text-sm font-semibold text-white no-underline bg-indigo-600 rounded-lg shadow-lg transition-colors hover:bg-indigo-500 shadow-indigo-500/20"
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
