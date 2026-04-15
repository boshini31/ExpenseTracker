import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionAPI = {
  getAll: (page = 0, size = 10, type = null) => {
    const params = { page, size };
    if (type) params.type = type;
    return api.get('/transactions', { params });
  },

  getById: (id) => api.get(`/transactions/${id}`),

  getByDateRange: (start, end) =>
    api.get('/transactions/range', { params: { start, end } }),

  getSummary: (start, end) => {
    const params = {};
    if (start) params.start = start;
    if (end)   params.end   = end;
    return api.get('/transactions/summary', { params });
  },

  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: (type = null) => {
    const params = type ? { type } : {};
    return api.get('/categories', { params });
  },
  getById:  (id)       => api.get(`/categories/${id}`),
  create:   (data)     => api.post('/categories', data),
  update:   (id, data) => api.put(`/categories/${id}`, data),
  delete:   (id)       => api.delete(`/categories/${id}`),
};

export default api;
