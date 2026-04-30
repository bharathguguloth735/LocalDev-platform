const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  sendOtp: async (email) => {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  googleAuth: async (googleData) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(googleData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getPublicPortfolio: async (username) => {
    const res = await fetch(`${API_URL}/public/portfolio/${username}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Portfolio not found' }));
      throw new Error(errorData.message || 'Portfolio not found');
    }
    return res.json();
  },

  updateRole: async (role) => {
    const res = await fetch(`${API_URL}/auth/update-role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  logout: async (sessionId) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── AI Estimation ─────────────────────────────────────────────────────────
  estimateCost: async (pages, features, complexity) => {
    const res = await fetch(`${API_URL}/ai/estimate-cost`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pages, features, complexity })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  getProjects: async (clientId = null) => {
    const url = clientId ? `${API_URL}/projects?client=${clientId}` : `${API_URL}/projects`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getProjectById: async (id) => {
    const res = await fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createProject: async (projectData) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  updateProject: async (id, projectData) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteProject: async (id) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  applyToProject: async (projectId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/apply`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  hireStudent: async (projectId, studentId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/hire/${studentId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMyJobs: async () => {
    const res = await fetch(`${API_URL}/projects/my/jobs`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Users & Talent ────────────────────────────────────────────────────────
  getDevelopers: async () => {
    const res = await fetch(`${API_URL}/users/developers/search`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch talent');
    return res.json();
  },

  getUserById: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/users/all`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateProfile: async (id, profileData) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updatePassword: async (passwordData) => {
    const res = await fetch(`${API_URL}/auth/password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(passwordData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Payments & Matrix Settlements (SIMULATED FLOWS) ───────────────────────
  getPayments: async () => {
    const res = await fetch(`${API_URL}/payments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch ledger');
    return res.json();
  },

  releasePayment: async (projectId) => {
    const res = await fetch(`${API_URL}/payments/project/${projectId}/release`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Overridden: Now uses the simulated backend order endpoint
  createSimulatedOrder: async (data) => {
    const res = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Overridden: Manual direct deposit bypasses legacy gateway
  depositWallet: async (amount) => {
    const res = await fetch(`${API_URL}/payments/deposit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  verifyRazorpayDeposit: async (paymentData) => {
    const res = await fetch(`${API_URL}/payments/deposit/verify-razorpay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  withdrawFunds: async (amount, upiId) => {
    const res = await fetch(`${API_URL}/payments/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, upiId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  processCheckout: async (payload) => {
    const res = await fetch(`${API_URL}/payments/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getCertificates: async () => {
    const res = await fetch(`${API_URL}/certificates`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch credentials');
    return res.json();
  },
  
  getPendingCertificates: async () => {
    const res = await fetch(`${API_URL}/certificates/pending`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pending credentials');
    return res.json();
  },

  issueCertificate: async (projectId) => {
    const res = await fetch(`${API_URL}/certificates/issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ projectId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Reviews ──────────────────────────────────────────────────────────────
  submitReview: async (reviewData) => {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getDeveloperReviews: async (developerId) => {
    const res = await fetch(`${API_URL}/reviews/developer/${developerId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Invitations ──────────────────────────────────────────────────────────
  sendInvitation: async (inviteData) => {
    const res = await fetch(`${API_URL}/invitations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(inviteData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMyInvitations: async () => {
    const res = await fetch(`${API_URL}/invitations/my-invites`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── AWS S3 File Uploads ──────────────────────────────────────────────────
  uploadAsset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser set multipart/form-data boundary
    
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Submissions ──────────────────────────────────────────────────────────
  submitProject: async (projectId, submissionData) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(submissionData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  approveProject: async (projectId, reviewData = {}) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Notifications ────────────────────────────────────────────────────────
  getNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  markNotificationRead: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteNotification: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  clearAllNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications/clear-all`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  exportSessions: async () => {
    const res = await fetch(`${API_URL}/reports/export-sessions`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getPlatformStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Financial Withdrawals ────────────────────────────────────────────────
  requestWithdrawal: async (withdrawalData) => {
    const res = await fetch(`${API_URL}/payments/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(withdrawalData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Phased Protocol ─────────────────────────────────────────────────────
  submitPhase: async (projectId, phaseId, deliverables) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/phases/${phaseId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(deliverables)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  approvePhase: async (projectId, phaseId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/phases/${phaseId}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── AI Assistant (Aura — Gemini 1.5 Flash, Multi-turn) ───────────────────
  chatWithAi: async (message, history = []) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Communication ────────────────────────────────────────────────────────
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMessages: async (userId) => {
    const res = await fetch(`${API_URL}/messages/${userId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  sendMessage: async (messageData) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messageData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  checkHealth: async () => {
    try {
      const res = await fetch(`${API_URL}/health`, { 
        method: 'GET',
        cache: 'no-store'
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};
