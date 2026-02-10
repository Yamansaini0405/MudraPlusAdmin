const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const userApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Block user
  blockUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/block-user/${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to block user: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // Restore user
  restoreUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/restore-user/${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to restore user: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  },

  // Update KYC status
  updateKycStatus: async (userId, status, reason = null) => {
    try {
      const body = { status };
      if (reason) {
        body.reason = reason;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/update-kyc-status/${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update KYC status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  },

  getUserDetails: async (userId, field = null) => {
    try {
      let url = `${API_BASE_URL}/api/v1/admin/user/${userId}`;
      if (field) {
        url += `?field=${field}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  // Get user basic info
  getUserBasicInfo: async (userId) => {
    return userApi.getUserDetails(userId);
  },

  // Get user bank details
  getUserBankDetails: async (userId) => {
    return userApi.getUserDetails(userId, 'bankDetails');
  },

  // Get user addresses
  getUserAddresses: async (userId) => {
    return userApi.getUserDetails(userId, 'addresses');
  },

  // Get user documents
  getUserDocuments: async (userId) => {
    return userApi.getUserDetails(userId, 'documents');
  },

  // Get user loans
  getUserLoans: async (userId) => {
    return userApi.getUserDetails(userId, 'loans');
  },

  // Get user activity/events
  getUserActivity: async (userId) => {
    return userApi.getUserDetails(userId, 'activity');
  },

  // Get user transactions
  getUserTransactions: async (userId) => {
    return userApi.getUserDetails(userId, 'transactions');
  },

  // Get user agents
  getUserAgents: async (userId) => {
    return userApi.getUserDetails(userId, 'agents');
  },

  // Get user follow-ups
  getUserFollowUps: async (userId) => {
    return userApi.getUserDetails(userId, 'followUps');
  },

  // Get user contacts list
  getUserContactsList: async (userId) => {
    return userApi.getUserDetails(userId, 'contactslist');
  },
};
