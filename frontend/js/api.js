/**
 * AnomalyGuard — API Client
 * Centralized API calls with JWT authentication headers
 */

const API = {
    BASE: '',

    /** Make authenticated API request */
    async request(endpoint, options = {}) {
        const token = AUTH.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const res = await fetch(`${this.BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (res.status === 401) {
            AUTH.logout();
            return null;
        }

        return res;
    },

    /** GET request */
    async get(endpoint) {
        const res = await this.request(endpoint);
        return res ? await res.json() : null;
    },

    /** POST request */
    async post(endpoint, body = {}) {
        const res = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return res ? await res.json() : null;
    },

    /** PUT request */
    async put(endpoint, body = {}) {
        const res = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return res ? await res.json() : null;
    },

    /** PATCH request */
    async patch(endpoint, body = {}) {
        const res = await this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
        return res ? await res.json() : null;
    },

    /** DELETE request */
    async delete(endpoint) {
        const res = await this.request(endpoint, { method: 'DELETE' });
        return res ? await res.json() : null;
    },

    /** POST with FormData (file uploads) */
    async upload(endpoint, formData) {
        const res = await this.request(endpoint, {
            method: 'POST',
            body: formData,
        });
        return res ? await res.json() : null;
    },

    // ============= Dashboard =============
    getDashboardStats: () => API.get('/api/v1/dashboard/stats'),
    getRecentAlerts: () => API.get('/api/v1/dashboard/recent-alerts'),
    getRecentPredictions: () => API.get('/api/v1/dashboard/recent-predictions'),
    getSystemHealth: () => API.get('/api/v1/dashboard/system-health'),
    getTrafficChart: () => API.get('/api/v1/dashboard/charts/traffic'),
    getProtocolChart: () => API.get('/api/v1/dashboard/charts/protocols'),
    getAttackChart: () => API.get('/api/v1/dashboard/charts/attacks'),

    // ============= Monitoring =============
    startMonitoring: (iface) => API.post('/api/v1/monitoring/start', { interface: iface }),
    stopMonitoring: () => API.post('/api/v1/monitoring/stop'),
    getMonitoringStatus: () => API.get('/api/v1/monitoring/status'),
    getInterfaces: () => API.get('/api/v1/monitoring/interfaces'),
    getMonitoringStats: () => API.get('/api/v1/monitoring/stats'),

    // ============= Packets =============
    getPackets: (page, perPage, protocol, status, search) => {
        let url = `/api/v1/packets?page=${page}&per_page=${perPage}`;
        if (protocol) url += `&protocol=${protocol}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return API.get(url);
    },
    startCapture: (iface) => API.post('/api/v1/packets/capture/start', { interface: iface }),
    stopCapture: () => API.post('/api/v1/packets/capture/stop'),

    // ============= ML =============
    predict: (modelName, features) => API.post('/api/v1/ml/predict', { model_name: modelName, features }),
    batchPredict: () => API.post('/api/v1/ml/predict/batch'),
    trainModel: (modelType, params) => API.post('/api/v1/ml/train', { model_type: modelType, params }),
    getModels: () => API.get('/api/v1/ml/models'),
    getPredictions: (page, perPage) => API.get(`/api/v1/ml/predictions?page=${page}&per_page=${perPage}`),
    activateModel: (name) => API.put(`/api/v1/ml/models/${name}/activate`),
    getFeatureImportance: (name) => API.get(`/api/v1/ml/feature-importance/${name}`),
    compareModels: () => API.post('/api/v1/ml/compare'),

    // ============= Attacks =============
    getAttacks: (page, perPage, type, severity, search) => {
        let url = `/api/v1/attacks?page=${page}&per_page=${perPage}`;
        if (type) url += `&attack_type=${type}`;
        if (severity) url += `&severity=${severity}`;
        if (search) url += `&search=${search}`;
        return API.get(url);
    },
    blockIP: (ip, reason, attackType) => API.post('/api/v1/attacks/block-ip', { ip_address: ip, reason, attack_type: attackType }),
    getBlockedIPs: () => API.get('/api/v1/attacks/blocked-ips/list'),

    // ============= Alerts =============
    getAlerts: (page, perPage, severity, status, search) => {
        let url = `/api/v1/alerts?page=${page}&per_page=${perPage}`;
        if (severity) url += `&severity=${severity}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return API.get(url);
    },
    getAlertCounts: () => API.get('/api/v1/alerts/count'),
    updateAlert: (id, data) => API.put(`/api/v1/alerts/${id}`, data),

    // ============= Reports =============
    generateReport: (type, format, dateFrom, dateTo) => API.post('/api/v1/reports/generate', {
        report_type: type, report_format: format, date_from: dateFrom, date_to: dateTo,
    }),
    getReports: () => API.get('/api/v1/reports'),
    deleteReport: (id) => API.delete(`/api/v1/reports/${id}`),

    // ============= Analytics =============
    getTrafficTrends: () => API.get('/api/v1/analytics/traffic-trends'),
    getAttackTrends: () => API.get('/api/v1/analytics/attack-trends'),
    getProtocolUsage: () => API.get('/api/v1/analytics/protocol-usage'),
    getTopAttackers: () => API.get('/api/v1/analytics/top-attackers'),
    getTopPorts: () => API.get('/api/v1/analytics/top-ports'),
    getModelMetrics: () => API.get('/api/v1/analytics/model-metrics'),
    getConfusionMatrix: (model) => API.get(`/api/v1/analytics/confusion-matrix/${model}`),
    getROCCurve: (model) => API.get(`/api/v1/analytics/roc-curve/${model}`),

    // ============= Datasets =============
    getDatasets: () => API.get('/api/v1/datasets'),
    getDataset: (id) => API.get(`/api/v1/datasets/${id}`),
    deleteDataset: (id) => API.delete(`/api/v1/datasets/${id}`),

    // ============= Users =============
    getUsers: (page, perPage, search) => {
        let url = `/api/v1/users?page=${page}&per_page=${perPage}`;
        if (search) url += `&search=${search}`;
        return API.get(url);
    },
    createUser: (data) => API.post('/api/v1/users', data),
    updateUser: (id, data) => API.put(`/api/v1/users/${id}`, data),
    deleteUser: (id) => API.delete(`/api/v1/users/${id}`),
    assignRole: (id, role) => API.patch(`/api/v1/users/${id}/role`, { role }),
    toggleUserStatus: (id, status) => API.patch(`/api/v1/users/${id}/status`, { status }),

    // ============= Logs =============
    getLoginLogs: (page, perPage, search) => {
        let url = `/api/v1/logs/login?page=${page}&per_page=${perPage}`;
        if (search) url += `&search=${search}`;
        return API.get(url);
    },
    getPacketLogs: (page, perPage) => API.get(`/api/v1/logs/packets?page=${page}&per_page=${perPage}`),
    getAttackLogs: (page, perPage) => API.get(`/api/v1/logs/attacks?page=${page}&per_page=${perPage}`),
    getPredictionLogs: (page, perPage) => API.get(`/api/v1/logs/predictions?page=${page}&per_page=${perPage}`),
    getSystemLogs: (page, perPage, level) => {
        let url = `/api/v1/logs/system?page=${page}&per_page=${perPage}`;
        if (level) url += `&level=${level}`;
        return API.get(url);
    },
    getAuditLogs: (page, perPage) => API.get(`/api/v1/logs/audit?page=${page}&per_page=${perPage}`),

    // ============= Settings =============
    getSettings: () => API.get('/api/v1/settings'),
    updateSettings: (settings) => API.put('/api/v1/settings', { settings }),
    changePassword: (current, newPass) => API.put('/api/v1/settings/password', { current_password: current, new_password: newPass }),
    getAPISettings: () => API.get('/api/v1/settings/api'),

    // ============= Profile =============
    getProfile: () => API.get('/api/v1/profile'),
    updateProfile: (data) => API.put('/api/v1/profile', data),

    // ============= Seed =============
    seedData: () => API.post('/api/v1/seed'),
};
