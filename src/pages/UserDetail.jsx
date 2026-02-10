'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Loader, AlertCircle, Download, Eye, EyeOff, Calendar,
  Mail, Phone, MessageSquare, Clock, Tag, User, Building2,
  FileText, Banknote, ClipboardList, History, Users,
  Bell, Search, MapPin, ExternalLink, X, ArrowDownLeft,
  UserPlus, Trash2, Plus
} from 'lucide-react';
import { userApi } from '@/services/userApi';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [userData, setUserData] = useState(null);
  const [showDocument, setShowDocument] = useState({});
  const [rejectReason, setRejectReason] = useState("");
  const [agentSearch, setAgentSearch] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(null); // Stores agent ID during action

  // Updated tabs to use Lucide components for consistency
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'bank', label: 'Bank Details', icon: Building2 },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'loans', label: 'Loans', icon: Banknote },
    { id: 'activity', label: 'Activity', icon: ClipboardList },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'contacts', label: 'Contact List', icon: Phone },
    { id: 'followups', label: 'Follow-ups', icon: Clock },
  ];

  useEffect(() => {
    fetchUserData();
  }, [userId, activeTab]);

  // Fetch agents based on search input
  useEffect(() => {
    const searchAgents = async () => {
      if (activeTab !== 'agents' || !agentSearch.trim()) {
        setAvailableAgents([]);
        return;
      }
      try {
        setIsSearching(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/getalladmins?type=agent`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        // Filter locally based on search term
        const filtered = data.filter(a =>
          a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
          a.email.toLowerCase().includes(agentSearch.toLowerCase())
        );
        setAvailableAgents(filtered);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchAgents, 500); // Debounce
    return () => clearTimeout(timer);
  }, [agentSearch, activeTab]);

  const handleAgentAction = async (agentId, isAssigning) => {
    try {
      setAssignmentLoading(agentId);
      const method = isAssigning ? 'POST' : 'DELETE';
      const endpoint = isAssigning ? 'assingn-agent' : 'unassingn-agent';

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: parseInt(userId), agentId: parseInt(agentId) })
      });

      if (response.ok) {
        setAgentSearch(''); // Clear search
        await fetchUserData(); // Refresh the tab
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Operation failed");
      }
    } catch (err) {
      alert("API Error: " + err.message);
    } finally {
      setAssignmentLoading(null);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      switch (activeTab) {
        case 'bank':
          data = await userApi.getUserBankDetails(userId);
          break;
        case 'addresses':
          data = await userApi.getUserAddresses(userId);
          break;
        case 'documents':
          data = await userApi.getUserDocuments(userId);
          break;
        case 'loans':
          data = await userApi.getUserLoans(userId);
          break;
        case 'activity':
          data = await userApi.getUserActivity(userId);
          break;
        case 'transactions':
          data = await userApi.getUserTransactions(userId);
          break;
        case 'agents':
          data = await userApi.getUserAgents(userId);
          break;
        case 'followups':
          data = await userApi.getUserFollowUps(userId);
          break;
        case 'contacts':
          data = await userApi.getUserContactsList(userId);
          break;
        default:
          data = await userApi.getUserBasicInfo(userId);
      }

      setUserData(data);
    } catch (err) {
      setError(err.message);
      console.error('[v0] Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleToggleBlock = async () => {
    const isBlocked = userData.isBlocked;
    const endpoint = isBlocked ? 'restore-user' : 'block-user';
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/${endpoint}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        await fetchUserData(); // Refresh data
      }
    } catch (err) {
      setError(`Action failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKYC = async (status) => {
    // 1. Validation for rejection reason
    if (status === 'rejected' && !rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      setLoading(true);
      // 2. API Call to update-kyc-status
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/update-kyc-status/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: status, // "verified" or "rejected"
          ...(status === 'rejected' && { reason: rejectReason }) // Only include reason if rejected
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Reset state and refresh data
        setRejectReason("");
        alert(data.message);
        await fetchUserData();
      } else {
        throw new Error(data.message || "Failed to update KYC status");
      }
    } catch (err) {
      setError(`KYC Update Error: ${err.message}`);
      console.error('[v0] Error updating KYC:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderBasicInfo = () => {
    if (!userData) return null;
    return (
      <div className="space-y-6">
        {/* New Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#1a3a6b]">User Profile Overview</h3>
          <button
            onClick={handleToggleBlock}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${userData.isBlocked
              ? 'bg-green-600 text-green-100 hover:bg-green-500'
              : 'bg-red-600 text-red-100 hover:bg-red-500'
              }`}
          >
            {userData.isBlocked ? 'Restore/Unblock User' : 'Block User '}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard label="Full Name" value={userData.name} />
          <InfoCard label="Email" value={userData.email} />
          <InfoCard label="Phone" value={userData.phone} />
          <InfoCard label="Gender" value={userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : '-'} />
          <InfoCard label="Date of Birth" value={formatDate(userData.dob)} />
          <InfoCard label="Employment Type" value={userData.employmentType ? userData.employmentType.charAt(0).toUpperCase() + userData.employmentType.slice(1) : '-'} />
          <InfoCard label="Company Name" value={userData.companyName || '-'} />
          <InfoCard label="Monthly Income" value={formatCurrency(userData.netMonthlyIncome)} />
          <InfoCard label="Next Income Date" value={userData.nextIncomeDate ? formatDate(userData.nextIncomeDate) : '-'} />
          <InfoCard label="Account Created" value={formatDate(userData.createdAt)} />
          <InfoCard label="Last Updated" value={formatDate(userData.updatedAt)} />
          <StatusCard label="KYC Status" value={userData.kycStatus} type="kyc" />
          <StatusCard label="Verified" value={userData.isVerified ? 'Yes' : 'No'} type={userData.isVerified ? 'success' : 'danger'} />
          <StatusCard label="Blocked" value={userData.isBlocked ? 'Yes' : 'No'} type={userData.isBlocked ? 'danger' : 'success'} />
          <InfoCard label="KYC Expiry" value={userData.kycExpireAt ? formatDate(userData.kycExpireAt) : '-'} />
        </div>
      </div>
    );
  };


  // Bank Details Tab
  const renderBankDetails = () => {
    if (!userData?.bankDetails || userData.bankDetails.length === 0) {
      return <EmptyState message="No bank details found" />;
    }
    return (
      <div className="space-y-4">
        {userData.bankDetails.map((bank) => (
          <div key={bank.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">{bank.bankName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Account Holder" value={bank.accountHolderName} />
              <InfoCard label="Account Number" value={maskAccountNumber(bank.accountNumber)} />
              <InfoCard label="IFSC Code" value={bank.ifscCode} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Addresses Tab
  const renderAddresses = () => {
    if (!userData?.addresses || userData.addresses.length === 0) {
      return <EmptyState message="No addresses found" />;
    }
    return (
      <div className="space-y-4">
        {userData.addresses.map((address) => (
          <div key={address.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">{address.addressType} Address</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">{address.addressType}</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Street" value={address.street} />
              <InfoCard label="City" value={address.city} />
              <InfoCard label="State" value={address.state} />
              <InfoCard label="Pin Code" value={address.pinCode} />
              <InfoCard label="Created" value={formatDate(address.createdAt)} />
              <InfoCard label="Updated" value={formatDate(address.updatedAt)} />
            </div>
          </div>
        ))}
      </div>
    );
  };



  // Documents Tab

  const renderDocuments = () => {
    if (!userData?.documents || userData.documents.length === 0) {
      return <EmptyState message="No documents found" />;
    }

    return (
      <div className="space-y-6">
        {/* Header with Verification Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#1a3a6b]">Documents</h3>

          {userData.kycStatus === "submitted" && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a6b] outline-none min-w-[200px]"
              />
              <button
                onClick={() => handleVerifyKYC('verified')}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Verify KYC
              </button>
              <button
                onClick={() => handleVerifyKYC('rejected')}
                className="px-4 py-2 bg-white border border-red-600 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Preserved Original Document Grid UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userData.documents.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900 capitalize text-sm">{formatDocumentType(doc.documentType)}</h4>
                <button
                  onClick={() => setShowDocument({ ...showDocument, [doc.id]: !showDocument[doc.id] })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showDocument[doc.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {showDocument[doc.id] && (
                <div className="mb-3 bg-gray-50 rounded p-2 max-h-40 overflow-hidden">
                  <img
                    src={getImageUrl(doc.documentUrl) || "/placeholder.svg"}
                    alt={doc.documentType}
                    className="w-full h-auto object-cover rounded"
                  />
                </div>
              )}
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <p>Created: {formatDate(doc.createdAt)}</p>
                <p>Updated: {formatDate(doc.updatedAt)}</p>
              </div>
              <a
                href={getImageUrl(doc.documentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors font-medium"
              >
                <Download size={14} />
                View Document
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loans Tab
  const renderLoans = () => {
    if (!userData?.loans || userData.loans.length === 0) {
      return <EmptyState message="No loans found" />;
    }
    return (
      <div className="space-y-4">
        {userData.loans.map((loan) => (
          <div key={loan.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="bg-gray-200 p-2 rounded-md flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{loan.loanNumber}</h3>
                <p className="text-xs text-gray-600">ID: {loan.id}</p>
              </div>
              <div className='flex items-center justify-center gap-4'>
                <StatusCard label="" value={loan.status} type={loan.status === 'closed' ? 'success' : loan.status === 'requested' ? 'warning' : 'info'} inline={true} />
                <button className='border border-[#1a3a6b] text-white text-sm px-2 py-0.5  rounded bg-[#1a3a6b] hover:bg-[#1a3a6b]/95 hover:text-white transition-colors cursor-pointer' onClick={() => navigate(`/loan/${loan.id}`)}>View</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard label="Requested Amount" value={formatCurrency(loan.requestedAmount)} />
              <InfoCard label="Principal Amount" value={loan.principalAmount ? formatCurrency(loan.principalAmount) : '-'} />
              <InfoCard label="Total Interest" value={loan.totalIntrest ? formatCurrency(loan.totalIntrest) : '-'} />
              <InfoCard label="Total Payable" value={loan.totalAmountPayable ? formatCurrency(loan.totalAmountPayable) : '-'} />
              <InfoCard label="Requested Tenure" value={`${loan.requestedTenure} days`} />
              <InfoCard label="Actual Tenure" value={loan.tenure ? `${loan.tenure} days` : '-'} />
              <InfoCard label="Remaining" value={loan.remainingAmount !== null ? formatCurrency(loan.remainingAmount) : '-'} />
              <InfoCard label="Start Date" value={loan.startDate ? formatDate(loan.startDate) : '-'} />
              <InfoCard label="End Date" value={loan.endDate ? formatDate(loan.endDate) : '-'} />
              <InfoCard label="Created" value={formatDate(loan.createdAt)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Activity Tab
  const renderActivity = () => {
    if (!userData?.events || userData.events.length === 0) {
      return <EmptyState message="No activity found" />;
    }

    // Helper to extract coordinates from the message string
    const extractCoordinates = (message) => {
      const latMatch = message.match(/Latitude:\s*([0-9.-]+)/);
      const lngMatch = message.match(/Longitude:\s*([0-9.-]+)/);

      if (latMatch && lngMatch) {
        return { lat: latMatch[1], lng: lngMatch[1] };
      }
      return null;
    };

    return (
      <div className="space-y-3">
        {userData.events.map((event) => {
          const coords = extractCoordinates(event.message);

          return (
            <div key={event.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-[#1a3a6b]/30 transition-colors shadow-sm">
              <div className="flex items-start gap-4">
                {/* Lucide Icons instead of Emojis */}
                <div className={`mt-1 p-2 rounded-full ${event.eventType === 'notification' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                  {event.eventType === 'notification' ? (
                    <Bell size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-[#1a3a6b] text-sm truncate">{event.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {event.message}
                  </p>

                  {/* Dynamic Google Maps Redirect */}
                  {coords && (
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <MapPin size={14} />
                        View on Google Maps
                        <ExternalLink size={12} className="opacity-50" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Transactions Tab
  const renderTransactions = () => {
    if (!userData?.transactions || userData.transactions.length === 0) {
      return <EmptyState message="No transactions found" />;
    }
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a3a6b] border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Loan Number</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userData.transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)} </td>
                <td className="px-6 py-3 text-sm">
                  <StatusCard value={transaction.transactionType} type={transaction.transactionType === 'disbursement' ? 'success' : 'danger'} inline={true} />
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{transaction.loan?.loanNumber || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-600 text-xs">{transaction.rpzOrderId || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-600 text-xs">{transaction.rpzPaymentId || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{formatDate(transaction.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Agents Tab
  const renderAgents = () => {
    return (
      <div className="space-y-8">
        {/* ===== Assigned Agents Table ===== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#1a3a6b] uppercase tracking-widest">
              Currently Assigned Agents
            </h3>

          </div>

          {!userData?.agentUsers || userData.agentUsers.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-400 text-sm font-medium">No agents assigned to this user.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a3a6b] border-b border-slate-100" >
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-white tracking-widest">Agent Info</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-white tracking-widest">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-white tracking-widest">Phone</th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase text-white tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userData.agentUsers.map((assignment) => {
                    const agent = assignment.agent;
                    return (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center text-xs font-bold uppercase">
                              {agent?.name?.charAt(0)}
                            </div>
                            <span className="text-md font-semibold text-slate-800">{agent?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{agent?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 uppercase">{agent?.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleAgentAction(assignment.agent.id, false)}
                            disabled={assignmentLoading === assignment.agent.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-semibold border border-red-100"
                          >
                            {assignmentLoading === assignment.agentId ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              // <Trash2 size={14} />
                              ""
                            )}
                            Unassign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== Assign New Agent Search Section ===== */}
        <div className="pt-8 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-semibold text-[#1a3a6b] uppercase tracking-widest">
            Assign New Agent
          </h3>

          {/* Search Input */}
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a3a6b] transition-colors"
            />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 transition-all shadow-sm"
            />
          </div>

          {/* Search Results Dropdown */}
          {agentSearch && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-12 text-center">
                  <Loader className="animate-spin inline text-[#1a3a6b]" size={24} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Searching Agents...</p>
                </div>
              ) : availableAgents.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-slate-400 text-sm font-medium italic">No agents found for "{agentSearch}"</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {availableAgents.map((agent) => {
                    const alreadyAssigned = userData.agentUsers?.some((a) => a.agentId === agent.id);

                    return (
                      <div
                        key={agent.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group/item"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover/item:bg-[#1a3a6b]/10 group-hover/item:text-[#1a3a6b] transition-colors">
                            {agent.name.charAt(0)}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">
                              {agent.email} • {agent.phone}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAgentAction(agent.id, true)}
                          disabled={assignmentLoading === agent.id || alreadyAssigned}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${alreadyAssigned
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-[#1a3a6b] text-white hover:bg-[#122a4f] shadow-md shadow-[#1a3a6b]/10'
                            }`}
                        >
                          {assignmentLoading === agent.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : alreadyAssigned ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Plus size={14} />
                          )}
                          {alreadyAssigned ? 'Already Assigned' : 'Assign to User'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Contact List Tab
  const renderContactsList = () => {
    if (!userData?.contactslist?.contactList || userData.contactslist.contactList.length === 0) {
      return <EmptyState message="No contacts found" />;
    }

    return (
      <div className="space-y-4">
        {userData.contactslist.contactList.map((contact, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center font-bold text-sm">
                  {(contact.displayName || 'C').charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{contact.displayName || 'Unknown Contact'}</h3>
              </div>
            </div>

            {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone Numbers</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {contact.phoneNumbers.map((phone, phoneIndex) => (
                    <div key={phoneIndex} className="flex items-center justify-between">
                      <a
                        href={`tel:${phone.replace(/\\s+/g, '')}`}
                        className="text-sm font-medium text-[#1a3a6b] hover:text-[#1a3a6b]/80 flex items-center gap-2 group"
                      >
                        <Phone size={16} className="group-hover:scale-110 transition-transform" />
                        {phone}
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(phone.replace(/\\s+/g, ''))}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Follow-ups Tab
  const renderFollowUps = () => {
    if (!userData?.followUps || userData.followUps.length === 0) {
      return <EmptyState message="No follow-ups scheduled" />;
    }

    const formatDateTime = (dateStr) => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const config = {
      call: { color: 'green', icon: Phone, bg: 'bg-green-50', text: 'text-green-700' },
      sms: { color: 'blue', icon: MessageSquare, bg: 'bg-blue-50', text: 'text-blue-700' },
      email: { color: 'purple', icon: Mail, bg: 'bg-purple-50', text: 'text-purple-700' },
      fieldvisit: { color: 'orange', icon: MapPin, bg: 'bg-orange-50', text: 'text-orange-700' },
      other: { color: 'slate', icon: Clock, bg: 'bg-slate-50', text: 'text-slate-700' }
    };

    return (
      <div className="flex flex-col gap-1.5">
        {userData.followUps.map((f) => {
          const typeKey = f.followUpType?.toLowerCase().replace(/\s/g, '') || 'other';
          const theme = config[typeKey] || config.other;
          const Icon = theme.icon;

          return (
            <div key={f.id} className="group flex items-center bg-white border border-slate-200 rounded-lg p-2 hover:border-[#1a3a6b] transition-colors shadow-sm overflow-hidden">

              {/* 1. TYPE & LOAN ID */}
              <div className="flex items-center gap-2 min-w-[140px] border-r border-slate-100 pr-3">
                <div className={`p-1.5 rounded ${theme.bg} ${theme.text}`}>
                  <Icon size={14} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-semibold uppercase leading-none ${theme.text}`}>{f.followUpType}</span>
                  <span className="text-[11px] font-bold text-slate-800">Loan #{f.loanId}</span>
                </div>
              </div>

              {/* 2. NOTE (The longest part, uses flex-1) */}
              <div className="flex-1 px-4 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">Note:</span>
                  <p className="text-[11px] text-slate-600 truncate italic">"{f.note || 'N/A'}"</p>
                </div>
              </div>

              {/* 3. FOLLOW UP DATE */}
              <div className="px-4 border-l border-slate-100 hidden md:block">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Last Follow-up</span>
                  <span className="text-[11px] font-semibold text-slate-700 mt-0.5">{formatDateTime(f.followUpDate)}</span>
                </div>
              </div>

              {/* 4. NEXT FOLLOW UP DATE (Highlighted) */}
              <div className="pl-4 border-l border-slate-100 min-w-[150px]">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-bold uppercase leading-none ${theme.text}`}>Next Schedule</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className={theme.text} />
                    <span className="text-[11px] font-semibold text-slate-900">{formatDateTime(f.nextFollowUpDate)}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    );
  };

  // Helper Components
  const InfoCard = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-gray-900 font-medium mt-1">{value}</p>
    </div>
  );

  const StatusCard = ({ label, value, type, inline }) => {
    const getColor = (type) => {
      switch (type) {
        case 'kyc':
          if (value === 'verified') return 'bg-green-100 text-green-800';
          if (value === 'rejected') return 'bg-red-100 text-red-800';
          return 'bg-yellow-100 text-yellow-800';
        case 'success':
          return 'bg-green-100 text-green-800';
        case 'danger':
          return 'bg-red-100 text-red-800';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800';
        case 'info':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const content = (
      <span className={`px-2 py-1 text-sm font-semibold rounded capitalize ${getColor(type)}`}>
        {value}
      </span>
    );

    if (inline) return content;

    return (
      <div>
        {label && <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">{label}</p>}
        {content}
      </div>
    );
  };

  const EmptyState = ({ message }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '-';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  };

  const formatDocumentType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getImageUrl = (documentUrl) => {
    const baseUrl = 'https://2q766kvz-3000.inc1.devtunnels.ms/';
    return `${baseUrl}${documentUrl}`;
  };

  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Data</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'bank':
        return renderBankDetails();
      case 'addresses':
        return renderAddresses();
      case 'documents':
        return renderDocuments();
      case 'loans':
        return renderLoans();
      case 'activity':
        return renderActivity();
      case 'transactions':
        return renderTransactions();
      case 'agents':
        return renderAgents();
      case 'contacts':
        return renderContactsList();
      case 'followups':
        return renderFollowUps();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Tabs Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200 p-2 rounded-2xl">
        <div className="flex gap-2 overflow-x-auto pb-4 -mb-4 no-scrollbar">

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${isActive
                  ? 'bg-[#1a3a6b]/10 text-[#1a3a6b] border-b-2 border-[#1a3a6b]'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-[#1a3a6b]' : 'text-gray-400'}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] font-medium text-gray-900 bg-white"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content - Maintaining consistent padding */}
      <div className="py-6 px-3 md:px-0">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Simplified container to match the LoanDetail content flow */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
