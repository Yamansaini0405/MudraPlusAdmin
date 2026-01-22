'use client';

import { useState, useEffect } from 'react';
import { Search, Loader, Clock, UserCheck, FileWarning, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function KYCUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  const kycFilters = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'submitted', label: 'Submitted', icon: Clock },
    { id: 'verified', label: 'Verified', icon: UserCheck },
    { id: 'rejected', label: 'Rejected', icon: FileWarning },
  ];

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  useEffect(() => {
    fetchKYCUsers();
  }, [activeFilter, page]);

  const fetchKYCUsers = async () => {
    try {
      setLoading(true);
      // Added page and limit parameters to the API request
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/users?kycStatus=${activeFilter}&page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("KYC Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">KYC Management</h1>
        <p className="text-gray-600 text-sm mt-1">Review and verify user identity documents</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {kycFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-[#1a3a6b] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={`Search ${activeFilter} users...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-[#1a3a6b]" size={32} />
        </div>
      ) : filteredUsers.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a3a6b] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Applied</th>
                    <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200  font-semibold">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 lowercase">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 text-center">
                        <span 
                          className="px-3 py-1 rounded-md cursor-pointer text-sm border border-[#1a3a6b] bg-blue-50 text-[#1a3a6b] font-semibold" 
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          Review
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-semibold uppercase">
            <span className="text-sm text-gray-600">Page {page}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={users.length < limit}
                onClick={() => setPage(prev => prev + 1)}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-gray-300 p-10 shadow-sm font-semibold uppercase">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">NO USERS FOUND</h3>
          <p className="text-gray-500 mt-1">There are no users matching your current criteria.</p>
        </div>
      )}
    </div>
  );
}