'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '@/components/ui/Dropdown';
import { userApi } from '@/services/userApi';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]); // Re-fetch on page change

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Update your service to accept page and limit
      const data = await userApi.getAllUsers(page, limit);
      setUsers(data.users);
      setTotalUsers(data.total || data.users.length); // Adjust based on your API response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (isVerified) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and monitor user accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      ) : filteredUsers.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a3a6b] text-white">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">KYC Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Verified</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Joined</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 lowercase">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getKycStatusColor(user.kycStatus)}`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getVerificationStatusColor(user.isVerified)}`}>
                          {user.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className='px-2 py-1 rounded-md cursor-pointer text-[12px] border border-[#1a3a6b] bg-blue-50 text-[#1a3a6b]' onClick={() => navigate(`/user/${user.id}`)}>View</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 font-bold uppercase">
              Page {page}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={filteredUsers.length < limit}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center uppercase font-bold text-gray-500">
          No users found.
        </div>
      )}
    </div>
  );
}