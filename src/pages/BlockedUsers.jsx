'use client';

import { useState, useEffect } from 'react';
import { Search, Loader, ShieldAlert, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BlockedUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchBlockedUsers();
  }, [page]); // Re-fetch when page changes

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      // Added page and limit parameters to the API request
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/users?isblocked=true&page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setActionLoading(id);
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/restore-user/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh current page after restoration
      fetchBlockedUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="">
        <h1 className="text-3xl font-semibold text-gray-900">Blocked Users</h1>
        <p className="text-gray-600 text-sm mt-1">Manage accounts with restricted access</p>
      </div>

      {/* Search bar matching consistency */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search blocked users..."
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
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm uppercase">
            <table className="w-full text-left font-semibold">
              <thead className="bg-[#1a3a6b] text-white">
                <tr>
                  <th className="px-6 py-3 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wide">Phone</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wide text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 lowercase font-normal">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-normal">{user.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleRestore(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-md text-sm border border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          {actionLoading === user.id ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        /* Empty State Matching KYC */
        <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-gray-300 p-10 shadow-sm font-semibold uppercase">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">NO USERS FOUND</h3>
          <p className="text-gray-500 mt-1 font-normal">There are no users matching your current criteria.</p>
        </div>
      )}
    </div>
  );
}