'use client';

import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users';
import UserDetail from '@/pages/UserDetail';
import AdminsList from '@/pages/AdminsList';
import CreateAdmin from '@/pages/AdminManagement';
import Loans from '@/pages/Loans';
import LoanDetail from '@/pages/LoanDetail';
import BlockedUsers from '@/pages/BlockedUsers';
import KYCUsers from '@/pages/KYCUsers';
import AdminManagement from '@/pages/AdminManagement';
import AssignAgent from '@/pages/AssignAgent';
import RequestedLoan from '@/pages/RequestedLoan';
import ActiveLoan from '@/pages/ActiveLoan';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Header */}
        <Header userName="Admin User" />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/blocked" element={<BlockedUsers />} />
              <Route path="/users/kyc" element={<KYCUsers />} />
              <Route path="/user/:userId" element={<UserDetail />} />
              <Route path="/admins" element={<AdminManagement />} />
              {/* <Route path="/admins/create" element={<CreateAdmin />} /> */}
              <Route path="/loans" element={<Loans />} />
              <Route path="/requested-loans" element={<RequestedLoan />} />
              <Route path="/active-loans" element={<ActiveLoan/>} />
              <Route path="/loan/:loanId" element={<LoanDetail />} />
              <Route path="/assignments" element={<AssignAgent />} />
              {/* Additional routes will be added here */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
