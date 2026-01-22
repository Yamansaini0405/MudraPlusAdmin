import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Applications',
      value: '2,456',
      change: '+12.5%',
      isPositive: true,
      icon: FileText,
    },
    {
      label: 'Active Borrowers',
      value: '1,892',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
    },
    {
      label: 'Approved Loans',
      value: '₹45.2Cr',
      change: '+15.3%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: 'Pending Review',
      value: '234',
      change: '-5.1%',
      isPositive: false,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="rounded-2xl bg-[#1a3a6b] p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-slate-200">
          Here's what's happening with your loan portfolio today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
                  <p className="text-3xl font-bold text-slate-900 mb-3">
                    {stat.value}
                  </p>

                  <div className="flex items-center gap-1 text-sm">
                    {stat.isPositive ? (
                      <>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {stat.change}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {stat.change}
                        </span>
                      </>
                    )}
                    <span className="text-slate-500 ml-1">
                      from last month
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#ff6b35]/15">
                  <Icon className="w-6 h-6 text-[#ff6b35]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Applications
            </h2>
            <button className="text-sm font-medium text-[#1a3a6b] hover:text-[#ff6b35] transition">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    Applicant #{2001 + item}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Loan Amount: ₹{50000 + item * 10000}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#ff6b35]/15 text-[#ff6b35]">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button className="w-full bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 text-white font-medium py-3 rounded-lg transition">
              Review Applications
            </button>

            <button className="w-full border-2 border-[#1a3a6b] text-[#1a3a6b] hover:bg-[#1a3a6b]/10 font-medium py-3 rounded-lg transition">
              Add New Borrower
            </button>

            <button className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-lg transition">
              Generate Report
            </button>

            <button className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-lg transition">
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
