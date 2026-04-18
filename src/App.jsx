import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy-loaded pages (React.lazy + Suspense)
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Subject = lazy(() => import('./pages/Subject'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/prj3">
      <ThemeProvider>
        <AuthProvider>
          <QuizProvider>
            <div className="min-h-screen bg-zinc-950 text-white">
              <Navbar />
              <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <Quiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subject"
                  element={
                    <ProtectedRoute>
                      <Subject />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </QuizProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
