'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Loader, Eye, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loanApi } from '@/services/loanApi';

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingLoanId, setApprovingLoanId] = useState(null);

  const statusOptions = ['all', 'active', 'closed', 'review', 'approve', 'requested'];
  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    closed: 'bg-green-100 text-green-800',
    review: 'bg-yellow-100 text-yellow-800',
    approve: 'bg-purple-100 text-purple-800',
    requested: 'bg-gray-100 text-gray-800',
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loanApi.getAllLoans();
      console.log('[v0] Loans fetched:', data);
      setLoans(data.loans || []);
    } catch (err) {
      setError(`Failed to fetch loans: ${err.message}`);
      console.error('[v0] Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          loan.loanNumber.toLowerCase().includes(term) ||
          loan.id.toString().includes(term)
      );
    }

    setFilteredLoans(filtered);
  };

  const handleViewLoan = (loanId) => {
    navigate(`/loan/${loanId}`);
  };

  const handleApproveLoan = async (loanId, e) => {
    e.stopPropagation();
    try {
      setApprovingLoanId(loanId);
      const response = await loanApi.approveLoanWithReview(loanId);
      console.log('[v0] Loan approved:', response);
      await fetchLoans();
    } catch (err) {
      setError(`Failed to approve loan: ${err.message}`);
      console.error('[v0] Error approving loan:', err);
    } finally {
      setApprovingLoanId(null);
    }
  };

  const getStatusBadge = (status) => {
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-1">Manage and track all loan applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total Loans</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Active Loans</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {loans.filter((l) => l.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Closed Loans</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {loans.filter((l) => l.status === 'closed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Under Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {loans.filter((l) => l.status === 'review' || l.status === 'requested').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by loan number or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loans Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-600" size={40} />
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No loans found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead >
                <tr className="bg-[#1a3a6b] border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Loan Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Principal Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Total Payable
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Remaining
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{loan.loanNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {loan.principalAmount ? formatCurrency(loan.principalAmount) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {loan.totalAmountPayable ? formatCurrency(loan.totalAmountPayable) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          loan.status
                        )}`}
                      >
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {loan.startDate ? formatDate(loan.startDate) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {loan.remainingAmount ? formatCurrency(loan.remainingAmount) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewLoan(loan.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          {/* <Eye size={16} /> */}
                          <span className="text-sm font-medium px-2 py-1 border border-[#1a3a6b] rounded-md bg-blue-50 text-[#1a3a6b]">View</span>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
