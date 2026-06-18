/**
 * AnomalyGuard — JWT Authentication Helper
 * Handles login, token storage, refresh, and auth state
 */

const AUTH = {
    TOKEN_KEY: 'anomalyguard_token',
    REFRESH_KEY: 'anomalyguard_refresh',
    USER_KEY: 'anomalyguard_user',

    /** Get stored access token */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /** Get stored refresh token */
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_KEY);
    },

    /** Get stored user info */
    getUser() {
        const data = localStorage.getItem(this.USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    /** Store tokens and user info after login */
    setAuth(data) {
        localStorage.setItem(this.TOKEN_KEY, data.access_token);
        localStorage.setItem(this.REFRESH_KEY, data.refresh_token);
        if (data.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        }
    },

    /** Clear all auth data */
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    /** Check if user is authenticated */
    isAuthenticated() {
        return !!this.getToken();
    },

    /** Login with credentials */
    async login(username, password) {
        const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Login failed');
        }

        const data = await res.json();
        this.setAuth(data);
        return data;
    },

    /** Register new account */
    async register(username, email, password, full_name) {
        const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Registration failed');
        }

        return await res.json();
    },

    /** Logout */
    logout() {
        this.clearAuth();
        window.location.href = '/';
    },

    /** Refresh token */
    async refresh() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.logout();
            return;
        }

        try {
            const res = await fetch('/api/v1/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!res.ok) {
                this.logout();
                return;
            }

            const data = await res.json();
            this.setAuth(data);
        } catch {
            this.logout();
        }
    },

    /** Require auth — redirect to login if not authenticated */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    },
};
