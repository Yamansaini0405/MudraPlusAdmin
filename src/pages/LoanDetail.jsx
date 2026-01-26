'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader, AlertCircle, Plus, X, Mail, Phone, MessageSquare, Clock, FileText,
    CreditCard,
    User,
    Building2,
    History,
    CheckCircle2,
    Link as LinkIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Users,
    Check
} from 'lucide-react';
import { loanApi } from '@/services/loanApi';
import { userApi } from '@/services/userApi';

export default function LoanDetail() {
    const { loanId } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [approvingLoanId, setApprovingLoanId] = useState(null);
    const [reviewData, setReviewData] = useState({
        principalAmount: '',
        tenure: '',
        intrestType: 'daily',
        intrestRate: '',
        totalIntrest: '',
        totalAmountPayable: '',
        expiryDays: '',
    });
    const [followUpData, setFollowUpData] = useState({
        note: '',
        followUpType: 'call',
        currentFollowupDate: '',
        followUpDate: '',
    });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const [agentSearch, setAgentSearch] = useState('');
    const [availableAgents, setAvailableAgents] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(null);
    const [assignedAgents, setAssignedAgents] = useState([]);


    const handleApproveLoan = async (loanId, e) => {
        e.stopPropagation();
        try {
            setApprovingLoanId(loanId);
            const response = await loanApi.approveLoanWithReview(loanId);
            console.log('[v0] Loan approved:', response);
            await fetchLoanDetails();
        } catch (err) {
            setError(`Failed to approve loan: ${err.message}`);
            console.error('[v0] Error approving loan:', err);
        } finally {
            setApprovingLoanId(null);
        }
    };

    const tabs = [
        { id: 'details', label: 'Loan & User Details', icon: FileText },
        { id: 'payment', label: 'Payment & Bank', icon: CreditCard },
        { id: 'transactions', label: 'Transactions', icon: History },
        { id: 'agents', label: 'Agents', icon: Users },
        { id: 'review', label: 'Update', icon: CheckCircle2 },
        { id: 'followup', label: 'Follow-up', icon: Clock },
        { id: 'paymentlink', label: 'Payment Link', icon: LinkIcon }
    ];

    useEffect(() => {
        fetchLoanDetails();
    }, [loanId]);

    // Auto-calculation logic for Review Data
    useEffect(() => {
        const principal = parseFloat(reviewData.principalAmount) || 0;
        const rate = parseFloat(reviewData.intrestRate) || 0;
        const tenure = parseInt(reviewData.tenure) || 0;

        let calculatedInterest = 0;

        if (reviewData.intrestType === 'daily') {
            // Daily: Rate is applied per day for the duration of the tenure
            calculatedInterest = principal * (rate / 100) * tenure;
        } else {
            // Flat: Rate is applied once to the principal
            calculatedInterest = principal * (rate / 100);
        }

        const totalPayable = principal + calculatedInterest;

        setReviewData(prev => ({
            ...prev,
            totalIntrest: calculatedInterest.toFixed(2),
            totalAmountPayable: totalPayable.toFixed(2)
        }));
    }, [reviewData.principalAmount, reviewData.intrestRate, reviewData.tenure, reviewData.intrestType]);

    // 1. Fetch currently assigned agents when 'agents' tab is active
    useEffect(() => {
        if (activeTab === 'agents' && loan?.userId) {
            fetchAssignedAgents();
        }
    }, [activeTab, loan?.userId]);

    const fetchAssignedAgents = async () => {
        try {
            setIsSearching(true);
            const data = await userApi.getUserAgents(loan.userId);
            setAssignedAgents(data.agentUsers || []);
        } catch (err) {
            console.error("Failed to fetch assigned agents", err);
        } finally {
            setIsSearching(false);
        }
    };

    // 2. Search for available agents (Debounced)
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

        const timer = setTimeout(searchAgents, 500);
        return () => clearTimeout(timer);
    }, [agentSearch, activeTab]);

    // 3. Handle Assign/Unassign
    const handleAgentAction = async (agentId, isAssigning) => {
        try {
            setAssignmentLoading(agentId);
            const endpoint = isAssigning ? 'assingn-agent' : 'unassingn-agent';

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/${endpoint}`, {
                method: isAssigning ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: parseInt(loan.userId), agentId: parseInt(agentId) })
            });

            if (response.ok) {
                setAgentSearch('');
                await fetchAssignedAgents();
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
    const fetchLoanDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await loanApi.getLoanDetails(loanId);
            console.log('[v0] Loan details fetched:', data);
            setLoan(data);
        } catch (err) {
            setError(`Failed to fetch loan details: ${err.message}`);
            console.error('[v0] Error fetching loan details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            setReviewLoading(true);
            setError(null);
            const data = {
                principalAmount: parseFloat(reviewData.principalAmount),
                tenure: parseInt(reviewData.tenure),
                intrestType: reviewData.intrestType,
                intrestRate: parseFloat(reviewData.intrestRate),
                totalIntrest: parseFloat(reviewData.totalIntrest),
                totalAmountPayable: parseFloat(reviewData.totalAmountPayable),
                expiryDays: parseInt(reviewData.expiryDays),
            };
            const response = await loanApi.reviewLoan(loanId, data);
            console.log('[v0] Loan review submitted:', response);
            setShowReviewForm(false);
            setReviewData({
                principalAmount: '',
                tenure: '',
                intrestType: 'flat',
                intrestRate: '',
                totalIntrest: '',
                totalAmountPayable: '',
                expiryDays: '',
            });
            await fetchLoanDetails();
        } catch (err) {
            setError(`Failed to submit review: ${err.message}`);
            console.error('[v0] Error submitting review:', err);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        try {
            setFollowUpLoading(true);
            setError(null);
            const data = {
                userId: loan.userId,
                note: followUpData.note,
                followUpType: followUpData.followUpType,
                followUpDate: followUpData.currentFollowupDate,
                nextFollowUpDate: followUpData.followUpDate,
            };
            const response = await loanApi.addFollowUp(loanId, data);
            console.log('[v0] Follow-up added:', response);
            setShowFollowUpForm(false);
            setFollowUpData({
                note: '',
                followUpType: 'call',
                currentFollowupDate: '',
                followUpDate: '',
            });
            await fetchLoanDetails();
        } catch (err) {
            setError(`Failed to add follow-up: ${err.message}`);
            console.error('[v0] Error adding follow-up:', err);
        } finally {
            setFollowUpLoading(false);
        }
    };

    const handleGeneratePaymentLink = async (e) => {
        e.preventDefault();
        try {
            setPaymentLoading(true);
            setGeneratedLink(null);
            // Assuming your loanApi has a method, otherwise use fetch/axios directly
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/loan/create-payment-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(paymentAmount),
                    loanId: parseInt(loanId)
                })
            });
            const data = await response.json();
            setGeneratedLink(data.link);
        } catch (err) {
            setError(`Failed to generate link: ${err.message}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleLoanStatus = async (loanId, e) => {
        e.preventDefault();
        try {
            setApprovingLoanId(loanId);
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/loan/change-status/${loanId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: 'defaulted' })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[v0] Loan status updated:', data);
                alert('Loan marked as defaulted successfully');
                await fetchLoanDetails();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update loan status');
                alert(errorData.message || 'Failed to mark loan as defaulted');
            }
        } catch (err) {
            setError(`Failed to update loan status: ${err.message}`);
            console.error('[v0] Error updating loan status:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setApprovingLoanId(null);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-blue-50 border-blue-200 text-blue-800',
            closed: 'bg-green-50 border-green-200 text-green-800',
            review: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            approve: 'bg-purple-50 border-purple-200 text-purple-800',
            requested: 'bg-gray-50 border-gray-200 text-gray-800',
        };
        return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            month: d.toLocaleString('en-US', { month: 'short' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const config = {
        email: { color: 'blue', icon: Mail },
        call: { color: 'green', icon: Phone },
        whatsapp: { color: 'emerald', icon: MessageSquare },
    };

    // Render Loan Details Tab
    const renderLoanDetails = () => {
        if (!loan) return null;

        const isRequested = loan.status === 'requested';
        const isApplied = loan.status === 'applied';

        return (
            <div className="bg-white rounded-lg border-l-4 border-[#1a3a6b] overflow-hidden shadow-sm">
                {/* Header Section */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-[#1a3a6b]">Loan Details</h2>
                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${isRequested ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {loan.status}
                        </span>
                    </div>

                    {/* Show Approve button ONLY if status is 'applied' */}
                    {isApplied && (
                        <button
                            onClick={(e) => handleApproveLoan(loan.id, e)}
                            disabled={approvingLoanId === loan.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-all"
                        >
                            {approvingLoanId === loan.id ? (
                                <Loader size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            <span className="text-sm font-medium">Approve Loan</span>
                        </button>
                    )}

                    {loan.status !== 'defaulted' && loan.status !== 'applied' && (<button
                        onClick={(e) => handleLoanStatus(loan.id, e)}
                        disabled={approvingLoanId === loan.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-all"
                    >


                        <span className="text-sm font-medium">Mark as Defaulted</span>
                    </button>)}

                </div>

                {/* Content Section */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Always visible: Loan Number */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loan Number</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.loanNumber}</p>
                        </div>

                        {isRequested ? (
                            /* VIEW FOR REQUESTED STATUS */
                            <>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested Amount</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {formatCurrency(loan.requestedAmount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested Tenure</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{loan.requestedTenure} days</p>
                                </div>
                            </>
                        ) : (
                            /* VIEW FOR APPLIED/APPROVED STATUS */
                            <>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Principal Amount</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {formatCurrency(loan.principalAmount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenure</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{loan.tenure} days</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interest Rate</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{loan.intrestRate}%</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Interest</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {formatCurrency(loan.totalIntrest)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {formatDate(loan.startDate)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render Payment Information Tab
    const renderPaymentInfo = () => {
        if (!loan) return null;
        return (
            <div className="bg-white rounded-lg border-l-4  border-[#1a3a6b] overflow-hidden shadow-sm">
                <div className="bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold text-[#1a3a6b]">Payment Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Total Amount Payable
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                {formatCurrency(loan.totalAmountPayable)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Amount Paid
                            </p>
                            <p className="text-lg font-semibold text-green-600 mt-1">
                                {formatCurrency(loan.amountPaid || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Remaining Amount
                            </p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                                {formatCurrency((loan.totalAmountPayable || 0) - (loan.amountPaid || 0))}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Next Payment Date
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render User Information Tab
    const renderUserInfo = () => {
        if (!loan || !loan.user) return <p className="text-gray-600">No user information available</p>;
        return (
            <div className="bg-white rounded-lg border-l-4  border-[#1a3a6b] overflow-hidden shadow-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#1a3a6b]">User Information</h2>
                    <span className='bg-[#1a3a6b] text-white px-2 py-1 rounded text-sm cursor-pointer' onClick={() => navigate(`/user/${loan.userId}`)}>View</span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Name
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Email
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Phone
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.user.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                User ID
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.user.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Bank Information Tab
    const renderBankInfo = () => {
        if (!loan || !loan.bank) return <p className="text-gray-600">No bank information available</p>;
        return (
            <div className="bg-white rounded-lg border-l-4  border-[#1a3a6b] overflow-hidden shadow-sm">
                <div className="bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold text-[#1a3a6b]">Bank Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Bank Name
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.bank.bankName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Account Holder
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.bank.accountHolderName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Account Number
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">
                                {loan.bank.accountNumber}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                IFSC Code
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{loan.bank.ifscCode}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Transactions Tab
    const renderTransactions = () => {
        // Accessing transactions from the updated loan object structure
        if (!loan || !loan.transactions || loan.transactions.length === 0) {
            return (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center shadow-sm">
                    <p className="text-gray-500 font-medium">No transactions available for this loan.</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Header matching the combined UI style */}
                <div className="bg-[#1a3a6b] px-6 py-4 flex items-center gap-2">
                    <History size={18} className="text-white" />
                    <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-md font-semibold text-slate-900 ">
                                    Status & Type
                                </th>
                                <th className="px-6 py-3 text-md font-semibold text-slate-900 ">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-md font-semibold text-slate-900 ">
                                    Razorpay Details
                                </th>
                                <th className="px-6 py-3 text-md font-semibold text-slate-900 ">
                                    Date & Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loan.transactions.map((transaction) => {
                                const isDisbursement = transaction.transactionType === 'disbursement';

                                return (
                                    <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Type Badge with Directional Icons */}
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold  border ${isDisbursement
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                }`}>
                                                {isDisbursement ? (
                                                    <ArrowUpRight size={14} strokeWidth={3} />
                                                ) : (
                                                    <ArrowDownLeft size={14} strokeWidth={3} />
                                                )}
                                                <span className='first-letter:uppercase'>{transaction.transactionType}</span>
                                            </div>
                                        </td>

                                        {/* Color-coded Amount */}
                                        <td className={`px-6 py-4 text-sm font-semibold ${isDisbursement ? 'text-blue-700' : 'text-emerald-700'
                                            }`}>
                                            {formatCurrency(transaction.amount)}
                                        </td>

                                        {/* Razorpay IDs */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-semibold text-slate-400 ">Order:</span>
                                                    <span className="text-sm font-mono text-slate-600">
                                                        {transaction.rpzOrderId || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Payment:</span>
                                                    <span className="text-[11px] font-mono text-slate-600">
                                                        {transaction.rpzPaymentId || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Formatted Date from createdAt */}
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(transaction.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer Summary */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Total Transactions: {loan.transactions.length}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        MudraPlus Ledger
                    </span>
                </div>
            </div>
        );
    };

    // Render Review Tab
    const renderReview = () => {
        if (loan.status !== 'requested') {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 text-blue-600" size={32} />
                    <p className="text-blue-800 font-medium">
                        Review form is only available for loans in 'requested' status.
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="bg-white rounded-lg border-l-4 border-l-[#1a3a6b] border border-gray-200 p-6 shadow-sm mb-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-semibold text-[#1a3a6b]">Loan Details</h2>
                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${loan.status === 'requested' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {loan.status}
                        </span>
                    </div>
                    <div className="p-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Always visible: Loan Number */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loan Number</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{loan.loanNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested Amount</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(loan.requestedAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested Tenure</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{loan.requestedTenure} days</p>
                            </div>


                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border-l-4 border-l-[#1a3a6b] border border-gray-200 p-6 shadow-sm">

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Update Loan Details</h2>
                            <p className="text-sm text-gray-600 mt-1">Enter loan review parameters</p>
                        </div>
                    </div>
                    {console.log(loan.status)}
                    {loan.status === 'requested' && (
                        <form onSubmit={handleSubmitReview} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Principal Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={reviewData.principalAmount}
                                        onChange={(e) =>
                                            setReviewData({ ...reviewData, principalAmount: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="useRequestedAmount"
                                            checked={reviewData.principalAmount === loan.requestedAmount.toString()}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setReviewData({ ...reviewData, principalAmount: loan.requestedAmount.toString() });
                                                }
                                            }}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <label htmlFor="useRequestedAmount" className="text-xs font-medium text-gray-600 cursor-pointer">
                                            Use Requested Amount ({formatCurrency(loan.requestedAmount)})
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tenure (days)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={reviewData.tenure}
                                        onChange={(e) => setReviewData({ ...reviewData, tenure: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="useRequestedTenure"
                                            checked={reviewData.tenure === loan.requestedTenure.toString()}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setReviewData({ ...reviewData, tenure: loan.requestedTenure.toString() });
                                                }
                                            }}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <label htmlFor="useRequestedTenure" className="text-xs font-medium text-gray-600 cursor-pointer">
                                            Use Requested Tenure ({loan.requestedTenure} days)
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Interest Type
                                    </label>
                                    <select
                                        required
                                        value={reviewData.intrestType}
                                        onChange={(e) =>
                                            setReviewData({ ...reviewData, intrestType: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Interest Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={reviewData.intrestRate}
                                        onChange={(e) =>
                                            setReviewData({ ...reviewData, intrestRate: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Interest
                                    </label>
                                    <input
                                        type="number"
                                        readOnly // Add this
                                        value={reviewData.totalIntrest}
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Amount Payable
                                    </label>
                                    <input
                                        type="number"
                                        readOnly // Add this
                                        value={reviewData.totalAmountPayable}
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 col-span-3 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Processing Fee %</p>
                                        <span className="text-lg font-semibold text-gray-900 mt-1 block">{loan.pfp}%</span>
                                    </div>
                                    <div>   
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Processing Amount</p>
                                        <span className="text-lg font-semibold text-red-600 mt-1 block">{formatCurrency(loan.pfp * reviewData.principalAmount / 100)}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">GST on Processing ({loan.gstp}%)</p>
                                        <span className="text-lg font-semibold text-red-600 mt-1 block">{formatCurrency((loan.pfp * reviewData.principalAmount / 100) * (loan.gstp / 100))}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Disbursement Amount</p>
                                        <span className="text-lg font-semibold text-green-600 mt-1 block">{formatCurrency(reviewData.principalAmount - (loan.pfp * reviewData.principalAmount / 100) - ((loan.pfp * reviewData.principalAmount / 100) * (loan.gstp / 100)))}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Days
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={reviewData.expiryDays}
                                    onChange={(e) =>
                                        setReviewData({ ...reviewData, expiryDays: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className="flex-1 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#1a3a6b]/95 disabled:opacity-50 transition-colors font-medium"
                                >
                                    {reviewLoading ? (
                                        <>
                                            <Loader className="inline animate-spin mr-2" size={16} />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>

                            </div>
                        </form>
                    )}
                </div>
            </>
        );
    };

    // Render Follow-up Tab
    const renderFollowUp = () => {
        if (loan.status !== 'active') {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 text-[#1a3a6b]" size={32} />
                    <p className="text-[#1a3a6b] font-medium">
                        Follow-up form is only available for loans in 'active' status.
                    </p>
                </div>
            );
        }

        return (
            <div>
                <div className="flex flex-col gap-2 mb-4">
                    {loan.followUps.map((f) => {
                        const { day, month, time } = formatDateTime(f.followUpDate);
                        const type = f.followUpType?.toLowerCase() || 'other';
                        const { color, icon: Icon } = config[type] || { color: 'orange', icon: MessageSquare };

                        return (
                            <div key={f.id} className="group flex items-center bg-white border border-slate-100 rounded-lg p-2 hover:shadow-md transition-all">
                                {/* Dynamic Date Badge */}
                                <div className={`flex flex-col items-center justify-center min-w-[45px] h-11 rounded bg-${color}-50 border border-${color}-100`}>
                                    <span className={`text-[10px] font-semibold text-${color}-600 uppercase leading-none`}>{month}</span>
                                    <span className={`text-sm font-semibold text-${color}-700`}>{day}</span>
                                </div>

                                {/* Content Body */}
                                <div className="flex-1 px-3 min-w-0 text-md">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-${color}-100/50 text-${color}-700 text-[13px] font-semibold uppercase`}>
                                            <span>Source:</span><Icon size={10} /> {type}
                                        </div>
                                    </div>
                                    <p className="text-[16px] text-slate-500 truncate mt-0.5 italic"><span className='font-semibold'>Note:</span>"{f.note}"</p>
                                </div>

                                {/* Time Indicator */}
                                <div className="flex flex-col items-end whitespace-nowrap border-l border-slate-50 pl-3">
                                    <span className="text-[13px] text-slate-400 font-medium">Next FollowUp</span>
                                    <div className="flex items-center gap-1 text-slate-700">
                                        <Clock size={10} className="text-slate-400 text-[16px]" />
                                        <span className="text-[16px] font-semibold">{f.nextFollowUpDate.slice()}</span>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-white rounded-lg border-l-4 border-l-[#1a3a6b] border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Add Follow-up</h2>
                            <p className="text-sm text-gray-600 mt-1">Schedule follow-up for this loan</p>
                        </div>
                        <button
                            onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#1a3a6b]/95 cursor-pointer transition-colors font-medium"
                        >
                            {showFollowUpForm ? <X size={18} /> : <Plus size={18} />}
                            <span>{showFollowUpForm ? 'Hide' : 'Add'} Follow-up</span>
                        </button>
                    </div>

                    {showFollowUpForm && (
                        <form onSubmit={handleAddFollowUp} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    value={followUpData.note}
                                    onChange={(e) =>
                                        setFollowUpData({ ...followUpData, note: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    placeholder="Enter follow-up notes..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Follow-up Type
                                    </label>
                                    <select
                                        required
                                        value={followUpData.followUpType}
                                        onChange={(e) =>
                                            setFollowUpData({ ...followUpData, followUpType: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    >
                                        <option value="call">Call</option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="fieldVisit">Field Visit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Follow-up Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={followUpData.currentFollowupDate}
                                        onChange={(e) =>
                                            setFollowUpData({ ...followUpData, currentFollowupDate: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Next Follow-up Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={followUpData.followUpDate}
                                        onChange={(e) =>
                                            setFollowUpData({ ...followUpData, followUpDate: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={followUpLoading}
                                    className="flex-1 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#1a3a6b]/95 disabled:opacity-50 transition-colors font-medium"
                                >
                                    {followUpLoading ? (
                                        <>
                                            <Loader className="inline animate-spin mr-2" size={16} />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Follow-up'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFollowUpForm(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}


                </div>

            </div>

        );
    };

    const renderPaymentLink = () => {
        return (
            <div className="bg-white rounded-lg border-l-4 border-l-[#1a3a6b] border border-gray-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Generate Payment Link</h2>
                    <p className="text-sm text-gray-600 mt-1">Create a custom payment request for this customer.</p>
                </div>

                <form onSubmit={handleGeneratePaymentLink} className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400">₹</span>
                            <input
                                type="number"
                                required
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a6b] outline-none"
                                placeholder="Enter amount"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={paymentLoading}
                        className="w-full py-2 bg-[#1a3a6b] text-white rounded-lg font-semibold hover:bg-[#122a4f] transition-colors disabled:opacity-50"
                    >
                        {paymentLoading ? 'Generating...' : 'Generate Link'}
                    </button>
                </form>

                {generatedLink && (
                    <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                            Payment Link Ready
                        </label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={generatedLink}
                                className="flex-1 bg-white border border-emerald-200 rounded px-3 py-2 text-sm text-emerald-800 font-mono"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${copySuccess ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    }`}
                            >
                                {copySuccess ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAgents = () => {
        return (
            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-[#1a3a6b] uppercase tracking-widest">Currently Assigned Agents</h3>
                    {assignedAgents.length === 0 ? (
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
                                    {assignedAgents.map((item) => (
                                        // 
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center text-xs font-bold ">
                                                        {item.agent?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-md font-semibold text-slate-800 first-letter:uppercase">{item.agent?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900">{item.agent?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 uppercase">{item.agent?.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleAgentAction(item.agent.id, false)}
                                                    disabled={assignmentLoading === item.agent.id}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-semibold border border-red-100"
                                                >
                                                    {assignmentLoading === item.agent.id ? (
                                                        <Loader size={14} className="animate-spin" />
                                                    ) : (
                                                        // <Trash2 size={14} />
                                                        ""
                                                    )}
                                                    Unassign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4">
                    <h3 className="text-sm font-semibold text-[#1a3a6b] uppercase tracking-widest">Assign New Agent</h3>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={agentSearch}
                            onChange={(e) => setAgentSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                        />
                    </div>

                    {agentSearch && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                            {isSearching ? <div className="p-4 text-center"><Loader className="animate-spin inline" /></div> :
                                availableAgents.map(agent => (
                                    <div key={agent.id} className="p-4 flex items-center justify-between border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-bold">{agent.name}</p>
                                            <p className="text-xs text-slate-500">{agent.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAgentAction(agent.id, true)}
                                            disabled={assignmentLoading === agent.id || assignedAgents.some(a => a.agentId === agent.id)}
                                            className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-xs"
                                        >
                                            {assignedAgents.some(a => a.agentId === agent.id) ? 'Assigned' : 'Assign'}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };



    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {renderLoanDetails()}
                        {renderUserInfo()}
                    </div>
                );
            case 'payment':
                return (
                    <div className="space-y-6">
                        {loan.status !== 'requested' && renderPaymentInfo()}
                        {renderBankInfo()}
                    </div>
                );
            case 'transactions':
                return renderTransactions();
            case 'agents':
                return renderAgents();
            case 'review':
                return renderReview();
            case 'followup':
                return renderFollowUp();
            case 'paymentlink':
                return renderPaymentLink();
            default:
                return renderLoanDetails();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader className="animate-spin text-[#1a3a6b]" size={40} />
            </div>
        );
    }

    if (error || !loan) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-600" size={40} />
                    <p className="text-red-600 font-semibold">{error || 'Loan not found'}</p>
                    <button
                        onClick={() => navigate('/loans')}
                        className="mt-4 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#1a3a6b]/95"
                    >
                        Back to Loans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-3 rounded-2xl">
                {/* <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/loans')}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div> */}

                {/* Tabs Navigation */}
                {/* Tabs Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mb-4 no-scrollbar ">

                    {tabs.map((tab) => {
                        const Icon = tab.icon; // Assign the component to a capitalized variable
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-[#1a3a6b]/10 text-[#1a3a6b] border-b-2 border-[#1a3a6b]'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {/* Render the Lucide Icon component */}
                                <Icon size={18} className={activeTab === tab.id ? 'text-[#1a3a6b]' : 'text-gray-400'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="py-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {renderTabContent()}
            </div>
        </div>
    );
}
