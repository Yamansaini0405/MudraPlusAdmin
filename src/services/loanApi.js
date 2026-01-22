const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const loanApi = {
  // Get all loans
  getAllLoans: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loans`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch loans: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  },

  // Get loan details by ID
  getLoanDetails: async (loanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loan/${loanId}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch loan details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loan details:', error);
      throw error;
    }
  },

  // Update loan status
  updateLoanStatus: async (loanId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loan/${loanId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update loan status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  },

  // Approve loan
  approveLoan: async (loanId) => {
    return loanApi.updateLoanStatus(loanId, 'approved');
  },

  // Reject loan
  rejectLoan: async (loanId) => {
    return loanApi.updateLoanStatus(loanId, 'rejected');
  },

  // Close loan
  closeLoan: async (loanId) => {
    return loanApi.updateLoanStatus(loanId, 'closed');
  },

  // Review loan with details
  reviewLoan: async (loanId, reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loan/review/${loanId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`Failed to review loan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reviewing loan:', error);
      throw error;
    }
  },

  // Add follow-up for loan
  addFollowUp: async (loanId, followUpData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loan/followup/${loanId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(followUpData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add follow-up: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw error;
    }
  },

  // Approve loan with status update
  approveLoanWithReview: async (loanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/loan/approve/${loanId}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to approve loan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  },
};
