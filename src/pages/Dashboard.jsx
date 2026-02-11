import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { adminApi } from '../services/adminApi'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getStats()
        setStats(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch stats')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const loanStats = stats
    ? [
        {
          label: 'Total Applications',
          value: stats.totalApplications,
          icon: FileText,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'Active Loans',
          value: stats.activeloans,
          icon: TrendingUp,
          color: 'bg-green-50 text-green-600',
        },
        {
          label: 'Pending Approvals',
          value: stats.pendingapprovals,
          icon: FileText,
          color: 'bg-yellow-50 text-yellow-600',
        },
        {
          label: 'Collected Amount',
          value: `₹${stats.collectedAmount?.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-purple-50 text-purple-600',
        },
      ]
    : []

  const userStats = stats
    ? [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'Pending KYC',
          value: stats.pendingKyc,
          icon: FileText,
          color: 'bg-orange-50 text-orange-600',
        },
        {
          label: 'Blocked Users',
          value: stats.blockedUsers,
          icon: Users,
          color: 'bg-red-50 text-red-600',
        },
        {
          label: 'Active Borrowers',
          value: stats.activeBorrower,
          icon: TrendingUp,
          color: 'bg-green-50 text-green-600',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl bg-[#1a3a6b] p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-slate-200">
          Here's what's happening with your loan portfolio today.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-red-700 text-sm">Error loading stats: {error}</p>
        </div>
      )}

      {/* Loan Stats Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Loan Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-8 text-slate-500">
              Loading stats...
            </div>
          ) : (
            loanStats.map((stat, index) => {
              const Icon = stat.icon
              const [bgColor, textColor] = stat.color.split(' ')
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* User Stats Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-8 text-slate-500">
              Loading stats...
            </div>
          ) : (
            userStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

        

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 text-white font-medium py-3 rounded-lg transition">
              Review Applications
            </button>

            <button className="border-2 border-[#1a3a6b] text-[#1a3a6b] hover:bg-[#1a3a6b]/10 font-medium py-3 rounded-lg transition">
              Add New Borrower
            </button>

            <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-lg transition">
              Generate Report
            </button>

            <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-lg transition">
              Settings
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg border border-[#1a3a6b]/30 bg-[#1a3a6b]/10">
            <p className="text-sm text-[#1a3a6b]">
              <span className="font-semibold">Tip:</span> Review pending
              applications regularly to maintain service quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
