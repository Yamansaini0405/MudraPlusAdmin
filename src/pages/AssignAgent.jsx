'use client';

import { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle, CheckCircle2, Users, User, X, UserCheck } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { userApi } from '@/services/userApi';

export default function AssignAgent() {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchUsersAndAgents();
  }, []);

  const fetchUsersAndAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersResponse, agentsResponse] = await Promise.all([
        userApi.getAllUsers(),
        adminApi.getAllAgents()
      ]);
      setUsers(usersResponse.users || []);
      setAgents(agentsResponse || []);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.phone].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAgents = agents.filter((a) =>
    [a.name, a.email, a.phone].some(field => field?.toLowerCase().includes(agentSearchTerm.toLowerCase()))
  );

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    newSelected.has(userId) ? newSelected.delete(userId) : newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const handleAssignUsers = async () => {
    if (!selectedAgent || selectedUsers.size === 0) return;
    try {
      setAssignLoading(true);
      const userIds = Array.from(selectedUsers);
      await adminApi.assignUsersToAgent(selectedAgent.id, userIds);
      
      setSuccessMessage(`Successfully assigned ${userIds.length} users to ${selectedAgent.name}`);
      setSelectedUsers(new Set());
      setSelectedAgent(null);
      await fetchUsersAndAgents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to assign: ${err.message}`);
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader size={40} className="animate-spin text-primary-600 mb-4" />
      <p className="text-gray-500 font-medium">Preparing dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-full mx-auto space-y-6 p-">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Assignment</h1>
          <p className="text-gray-500 text-sm">Map multiple users to a dedicated service agent</p>
        </div>
        
        <button
          onClick={() => handleAssignUsers()}
          disabled={assignLoading || !selectedAgent || selectedUsers.size === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
        >
          {assignLoading ? <Loader size={18} className="animate-spin" /> : <UserCheck size={18} />}
          Assign {selectedUsers.size > 0 ? `${selectedUsers.size} Users` : 'Selected'}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} /> <span className="text-sm font-medium">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} /> <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* STEP 1: AGENT SELECTION */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Step 1: Select Target Agent</h2>
        </div>

        <div className="p-6">
          {!selectedAgent ? (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search agents by name, email or phone..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={agentSearchTerm}
                  onChange={(e) => {
                    setAgentSearchTerm(e.target.value);
                    setShowAgentDropdown(true);
                  }}
                  onFocus={() => setShowAgentDropdown(true)}
                />
              </div>

              {showAgentDropdown && agentSearchTerm && (
                <div className="fixed mt-2 w-[calc(100%-3rem)] bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                  {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setAgentSearchTerm('');
                        setShowAgentDropdown(false);
                      }}
                      className="p-4 hover:bg-indigo-50 cursor-pointer flex items-center justify-between group transition-colors border-b last:border-0"
                    >
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-700">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email} • {agent.phone}</p>
                      </div>
                      <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        Select
                      </button>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-gray-500 italic">No agents found matching "{agentSearchTerm}"</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* COMPACT TABLE VIEW FOR SELECTED AGENT */
            <div className="overflow-hidden border border-indigo-100 rounded-lg">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase">Selected Agent</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase">Email Address</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase">Phone</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-indigo-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">{selectedAgent.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{selectedAgent.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{selectedAgent.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedAgent(null)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                        title="Remove selection"
                      >
                        <X size={20} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: USER LIST */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Step 2: Choose Users</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Filter users..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={() => {
                      if (selectedUsers.size === filteredUsers.length) setSelectedUsers(new Set());
                      else setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                    }}
                  />
                </th>
                <th className="px-6 py-3">User Profile</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">KYC Status</th>
                <th className="px-6 py-3 text-center">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedUsers.has(user.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      user.kycStatus === 'verified' ? 'bg-green-100 text-green-700 border-green-200' :
                      user.kycStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {user.kycStatus || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      <Users size={12} /> {user._count?.agentUsers || 0}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users className="text-gray-400" size={30} />
              </div>
              <h3 className="text-gray-900 font-medium">No users found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}