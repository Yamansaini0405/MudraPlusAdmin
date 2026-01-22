'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Logo from "../assets/Logo2.png"
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setIsAuthenticated }) {

  const API_BASE_URL = import.meta.env.VITE_BASE_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault()
  setError("")
  setIsLoading(true)

  try {
    // 1. Validate inputs
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    // 2. API call
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/adminlogin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data?.message || "Invalid email or password")
      return
    }

    // 3. Store token separately
    localStorage.setItem("token", data.token)

    // 4. Store admin data individually
    localStorage.setItem("admin_id", data.admin.id)
    localStorage.setItem("admin_email", data.admin.email)
    localStorage.setItem("admin_name", data.admin.name)
    localStorage.setItem("role", data.admin.role)

    // 5. Update app state
    setIsAuthenticated(true)

    // 6. Redirect
    navigate("/admin/dashboard")

  } catch (err) {
    console.error(err)
    setError("Login failed. Please try again later.")
  } finally {
    setIsLoading(false)
  }
}



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Logo and branding */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center p-2">
              <img 
                src={Logo} 
                alt="MudraPlus Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              {/* <h1 className="text-3xl font-semibold text-primary-500">MudraPlus</h1> */}
              <p className="text-gray-900 text-lg mt-2">Loan Administration Panel</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="admin@mudraplus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-2 h-11 border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 h-11 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>



          {/* Footer */}
          <div className="text-center text-xs text-gray-600">
            <p>© 2026 MudraPlus. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
