'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader, Trash2, Shield, User } from 'lucide-react';
import Dropdown from '@/components/ui/dropdown';
import { adminApi } from '@/services/adminApi';

export default function AdminsList() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phone.includes(searchTerm)
    );
    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAllAdmins();
      console.log('[v0] Admins fetched:', data);
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[v0] Error fetching admins:', err);
      setError('Failed to load admins. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (admin, action) => {
    try {
      setActionLoading(admin.id);

      if (action.id === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
          await adminApi.deleteAdmin(admin.id);
          console.log('[v0] Admin deleted:', admin.id);
          await fetchAdmins();
        }
      }
    } catch (err) {
      setError(`Failed to ${action.label}: ${err.message}`);
      console.error(`[v0] Error performing action ${action.id}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getActionItems = (admin) => {
    return [
      {
        id: 'delete',
        label: 'Delete',
        isDanger: true,
      },
    ];
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          <Shield size={14} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        <User size={14} />
        Agent
      </span>
    );
  };

  return (
    <div className="p- bg-gray-50 min-h-screen max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin & Agent Management</h1>
          <p className="text-gray-600 mt-2">Manage all administrators and agents in your system</p>
        </div>
        <button
          onClick={() => navigate('/create-admin')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(a => a.role === 'agent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(a => a.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Loader size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="text-primary-600 animate-spin" />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No admins or agents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a3a6b] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Created Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      {getRoleBadge(admin.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {actionLoading === admin.id ? (
                          <Loader size={18} className="text-primary-600 animate-spin" />
                        ) : (
                          <Dropdown
                            items={getActionItems(admin)}
                            onSelect={(action) => handleAdminAction(admin, action)}
                          >
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                              <span className="text-gray-600 font-bold text-lg">⋮</span>
                            </button>
                          </Dropdown>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    
    </div>
  );
}
