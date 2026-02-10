'use client';

import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ShieldAlert,
  FileCheck,
  Circle,
  LayoutList,
  User
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/Logo2.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Loans',
      icon: FileText,
      path: '/loans',
      submenu: [
        { label: 'All Loans', path: '/loans', icon: LayoutList },
        { label: 'Requested Loans', path: '/requested-loans', icon: FileText },
        { label: 'Active Loans', path: '/active-loans', icon: FileCheck },
      ],
      allowedRoles: ['admin', 'agent']
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      submenu: [
        { label: 'All Users', path: '/users', icon: Users },
        { label: 'Blocked Users', path: '/users/blocked', icon: ShieldAlert },
        { label: 'Pending KYC', path: '/users/kyc', icon: FileCheck },
      ],
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

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

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
            const hasSubmenu = item.submenu?.length;
            const active = isActive(item.path);
            const isExpanded = expandedMenu === item.label || (active && expandedMenu === null);

            return (
              <div key={item.label} className="space-y-1">
                {hasSubmenu ? (
                  /* Parent Menu Item with Submenu */
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${active 
                        ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  /* Standard Link Item */
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${active 
                        ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    {isOpen && <span className="flex-1 text-left">{item.label}</span>}
                  </Link>
                )}

                {/* Submenu Items */}
                {hasSubmenu && isOpen && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-2 animate-in slide-in-from-left-2 duration-300">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon || Circle;
                      const subActive = location.pathname === sub.path;

                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all
                            ${subActive 
                              ? 'text-[#ff6b35] bg-[#ff6b35]/10' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                          <SubIcon size={14} strokeWidth={subActive ? 3 : 2} />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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