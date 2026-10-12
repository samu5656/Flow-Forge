import axios from 'axios';

export const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('ff_token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ----------------------------------------------------
   API SERVICE DEFINITIONS
---------------------------------------------------- */

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  uploadAvatar: (formData) =>
    api.patch('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const orgApi = {
  list: (params) => api.get('/organizations', { params }),
  get: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.patch(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
};

export const teamApi = {
  list: (orgId) => api.get(`/organizations/${orgId}/teams`),
  get: (orgId, teamId) => api.get(`/organizations/${orgId}/teams/${teamId}`),
  create: (orgId, data) => api.post(`/organizations/${orgId}/teams`, data),
  update: (orgId, teamId, data) => api.patch(`/organizations/${orgId}/teams/${teamId}`, data),
  delete: (orgId, teamId) => api.delete(`/organizations/${orgId}/teams/${teamId}`),
};

export const projectApi = {
  list: (orgId) => api.get(`/organizations/${orgId}/projects`),
  get: (orgId, projectId) => api.get(`/organizations/${orgId}/projects/${projectId}`),
  create: (orgId, data) => api.post(`/organizations/${orgId}/projects`, data),
  update: (orgId, projectId, data) => api.patch(`/organizations/${orgId}/projects/${projectId}`, data),
  delete: (orgId, projectId) => api.delete(`/organizations/${orgId}/projects/${projectId}`),
};

export const issueApi = {
  list: (orgId, projectId, params) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/issues`, { params }),
  get: (orgId, projectId, issueId) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}`),
  create: (orgId, projectId, data) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/issues`, data),
  update: (orgId, projectId, issueId, data) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}`, data),
  delete: (orgId, projectId, issueId) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}`),
};

export const taskApi = {
  list: (orgId, projectId, issueId) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}/tasks`),
  create: (orgId, projectId, issueId, data) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}/tasks`, data),
  update: (orgId, projectId, issueId, taskId, data) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}/tasks/${taskId}`, data),
  delete: (orgId, projectId, issueId, taskId) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/issues/${issueId}/tasks/${taskId}`),
};

export const labelApi = {
  list: (orgId, projectId) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/labels`),
  create: (orgId, projectId, data) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/labels`, data),
  update: (orgId, projectId, labelId, data) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/labels/${labelId}`, data),
  delete: (orgId, projectId, labelId) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/labels/${labelId}`),
};

export const milestoneApi = {
  list: (orgId, projectId) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/milestones`),
  create: (orgId, projectId, data) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/milestones`, data),
  update: (orgId, projectId, milestoneId, data) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/milestones/${milestoneId}`, data),
  delete: (orgId, projectId, milestoneId) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/milestones/${milestoneId}`),
};

export const githubApi = {
  getConnectUrl: () => api.get('/github/connect'),
  getRepositories: () => api.get('/github/repositories'),
  disconnect: () => api.delete('/github/disconnect'),
  getProjectRepos: (orgId, projectId) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/github`),
  connectProjectRepo: (orgId, projectId, data) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/github`, data),
  disconnectProjectRepo: (orgId, projectId, repoId) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/github/${repoId}`),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
};

export const healthApi = {
  check: () => axios.get('/health'),
};

export default api;
