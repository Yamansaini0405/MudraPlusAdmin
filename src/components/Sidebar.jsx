'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  FileCheck,
  LayoutList,
  User
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/Logo2.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'All Loans',
      icon: LayoutList,
      path: '/loans',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Requested Loans',
      icon: FileText,
      path: '/requested-loans',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Active Loans',
      icon: FileCheck,
      path: '/active-loans',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'All Users',
      icon: Users,
      path: '/users',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Blocked Users',
      icon: ShieldAlert,
      path: '/users-blocked',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Pending KYC',
      icon: FileCheck,
      path: '/users-kyc',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Admin & Agents',
      icon: LayoutList,
      path: '/admins',
      allowedRoles: ['admin']
    },
    {
      label: 'User Assignments',
      icon: User,
      path: '/assignments',
      allowedRoles: ['admin']
    },
    
    // {
    //   label: 'Settings',
    //   icon: Settings,
    //   path: '/settings',
    //   allowedRoles: ['admin', 'agent']
    // },
  ];

  // Helper to check if a path or its sub-paths are active
  const isActive = (path) => 
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#1a3a6b] text-white shadow-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#1a3a6b] text-white flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
        md:relative`}
      >
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
            <img src={Logo} alt="MudraPlus" className="w-8 h-8 object-contain" />
          </div>
          {isOpen && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-lg font-semibold leading-tight tracking-tight">MudraPlus</h1>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest">{localStorage.getItem('role').toUpperCase()} Systems</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {menuItems.filter(item => item.allowedRoles.includes(localStorage.getItem('role'))).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${active 
                    ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {isOpen && <span className="flex-1 text-left">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-sm"
          >
            <LogOut size={20} />
            {isOpen && <span>Logout Session</span>}
          </button>
        </div>
      </aside>
    </>
  );
}