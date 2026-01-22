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

export const adminApi = {
  // Create new admin or agent
  createAdmin: async (adminData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/create-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create admin: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Get all admins and agents
  getAllAdmins: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/getalladmins`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admins: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Delete admin (soft delete - set isDeleted flag)
  deleteAdmin: async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete-admin/${adminId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete admin: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },

  // Update admin
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/update-admin/${adminId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update admin: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },
};
