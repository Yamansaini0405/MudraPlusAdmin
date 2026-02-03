'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Loader, Shield, User, 
  UserPlus, Lock, X, RefreshCw, Trash2, MoreVertical
} from 'lucide-react';
import Dropdown from '@/components/ui/Dropdown';
import { adminApi } from '@/services/adminApi';

export default function AdminManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'agent',
  });

  useEffect(() => { fetchAdmins(); }, []);

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
      const data = await adminApi.getAllAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) { setError('Failed to load admins.'); } 
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");
    
    try {
      setFormLoading(true);
      await adminApi.createAdmin(formData);
      setSuccess("Account created successfully!");
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'agent' });
      fetchAdmins();
    } catch (err) { setError(err.message); } 
    finally { setFormLoading(false); }
  };

  const getRoleBadge = (role) => (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold uppercase tracking-wider border ${
      role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
    }`}>
      {role === 'admin' ? <Shield size={12} /> : <User size={12} />}
      {role}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section - Matches Users.jsx */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin & Agent Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage system administrators and field agents</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#122a4f] transition-colors font-semibold shadow-sm"
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          {showCreateForm ? 'Close Form' : 'Add New Member'}
        </button>
      </div>

      {/* New Member Form - Layout from Image Reference */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-[#1a3a6b] px-6 py-3 border-b border-gray-100 flex items-center gap-2">
            <UserPlus size={18} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Add New System Member</h2>
          </div>
          
          <form onSubmit={handleCreateAdmin} className="p-6 space-y-8">
            {/* Section: Basic Information */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#1a3a6b] uppercase tracking-widest border-b border-gray-100 pb-2">
                Basic Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Full Name *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" placeholder="Enter first name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Email Address *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" placeholder="example@company.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Phone Number *</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" placeholder="9876543210" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 bg-white">
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Account Settings */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#1a3a6b] uppercase tracking-widest border-b border-gray-100 pb-2">
                Account Settings
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Password *</label>
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" placeholder="Enter password" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">Confirm Password *</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" placeholder="Confirm password" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button disabled={formLoading} type="submit" className="px-6 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-semibold hover:bg-[#122a4f] flex items-center gap-2">
                {formLoading ? <Loader size={16} className="animate-spin" /> : 'Save Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar - Consistent with Users.jsx */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search members by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] transition-all shadow-sm"
        />
      </div>

      {/* Members Table - Matches Blocked/KYC Table Design */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader className="animate-spin text-[#1a3a6b]" size={32} /></div>
      ) : filteredAdmins.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1a3a6b] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Member Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wide">Joined Date</th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-[#1a3a6b] font-black text-xs uppercase">
                          {admin.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                     <span className="text-[13px] font-semibold text-gray-900 uppercase tracking-tighter">{admin.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600">{admin.email}</span>
                        
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{getRoleBadge(admin.role)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-semibold">
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-300 p-20 shadow-sm text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
             <User size={40} className="text-gray-200" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 uppercase">No Members Found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}