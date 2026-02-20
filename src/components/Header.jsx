'use client'

import { Bell, Search, User, ChevronDown, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from "../assets/Logo2.png";

export default function Header({ userName = 'Admin User' }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  const notifications = [
    { id: 1, text: '5 new loan applications submitted', time: '2 hours ago', unread: true },
    { id: 2, text: 'Portfolio performance report ready', time: '4 hours ago', unread: true },
    { id: 3, text: 'Customer verification completed', time: '1 day ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    localStorage.removeItem('admin_name')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">

        {/* Search */}
        {/* <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications, borrowers..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300
              focus:outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/20
              text-sm"
            />
          </div>
        </div> */}

        <div>
          <h1 className="text-2xl hidden md:block font-bold text-gray-900">Loan Management System</h1>
          <p className="text-sm hidden md:block text-gray-500">Comprehensive finance management platform</p>
        </div>
        <div className="flex items-center gap-3 md:hidden border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
            <img src={Logo} alt="MudraPlus" className="w-8 h-8 object-contain" />
          </div>

          <div className="animate-in fade-in duration-500">
            <h1 className="text-lg font-semibold leading-tight tracking-tight">MudraPlus</h1>
          </div>

        </div>


        {/* Actions */}
        <div className="flex items-center gap-4">


          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-slate-100 transition">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          {/* Profile */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
            <div
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center font-bold">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-500">{localStorage.getItem('role').toUpperCase()}</p>
              </div>
            </div>

            
          </div>

        </div>
      </div>
    </header>
  )
}
