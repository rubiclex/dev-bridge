const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class SbuService {
    constructor(baseURL, authToken) {
        this.baseURL = baseURL;
        this.authToken = authToken; // Your initial auth token (64+ chars)
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenFilePath = path.join(__dirname, '../../tokens/tokens.json');

        // Create axios instance
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor to include access token
        this.api.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshAccessToken();
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError.message);
                        // If refresh fails, try to login again
                        await this.login();
                        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                        return this.api(originalRequest);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Initialize the auth service - load tokens and login if needed
     */
    async initialize() {
        try {
            // Try to load existing tokens
            await this.loadTokens();

            // Verify if access token is still valid
            if (this.accessToken) {
                try {
                    await this.verifyToken();
                    console.log('Existing access token is valid');
                    return true;
                } catch (error) {
                    console.log('Existing access token is invalid, attempting refresh...');
                }
            }

            // Try to refresh if we have a refresh token
            if (this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    console.log('Successfully refreshed access token');
                    return true;
                } catch (error) {
                    console.log('Refresh token is invalid, logging in with auth token...');
                }
            }

            // Login with auth token
            await this.login();
            console.log('Successfully logged in with auth token');
            return true;

        } catch (error) {
            console.error('Failed to initialize auth service:', error.message);
            throw error;
        }
    }

    /**
     * Login with the initial auth token
     */
    async login() {
        try {
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                token: this.authToken
            });

            this.accessToken = response.data.accessToken;
            this.refreshToken = response.data.refreshToken;

            // Save tokens to file
            await this.saveTokens();

            console.log('Login successful');
            return response.data;

        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Refresh the access token using refresh token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post(`${this.baseURL}/api/auth/refresh`, {
                refreshToken: this.refreshToken
            });

            this.accessToken = response.data.accessToken;

            // Save updated tokens
            await this.saveTokens();

            console.log('Access token refreshed successfully');
            return response.data;

        } catch (error) {
            console.error('Token refresh failed:', error.response?.data || error.message);
            // Clear invalid refresh token
            this.refreshToken = null;
            await this.saveTokens();
            throw new Error(`Token refresh failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Verify current access token
     */
    async verifyToken() {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await axios.get(`${this.baseURL}/api/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            throw new Error(`Token verification failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Logout from current session
     */
    async logout() {
        if (!this.refreshToken) {
            console.log('No refresh token to logout');
            return;
        }

        try {
            await axios.post(`${this.baseURL}/api/auth/logout`, {
                refreshToken: this.refreshToken
            });

            console.log('Logout successful');

        } catch (error) {
            console.error('Logout failed:', error.response?.data || error.message);
        } finally {
            // Clear tokens regardless of logout success
            this.accessToken = null;
            this.refreshToken = null;
            await this.saveTokens();
        }
    }

    /**
     * Logout from all sessions
     */
    async logoutAll() {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await this.api.post('/api/auth/logout-all');

            // Clear local tokens
            this.accessToken = null;
            this.refreshToken = null;
            await this.saveTokens();

            console.log('Logged out from all devices');
            return response.data;

        } catch (error) {
            console.error('Logout all failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Save tokens to file
     */
    async saveTokens() {
        try {
            const tokens = {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                lastUpdated: new Date().toISOString()
            };

            await fs.writeFile(this.tokenFilePath, JSON.stringify(tokens, null, 2));
        } catch (error) {
            console.error('Failed to save tokens:', error.message);
        }
    }

    /**
     * Load tokens from file
     */
    async loadTokens() {
        try {
            const data = await fs.readFile(this.tokenFilePath, 'utf8');
            const tokens = JSON.parse(data);

            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;

            console.log('Tokens loaded from file');
        } catch (error) {
            // File doesn't exist or is invalid, that's okay
            console.log('No existing tokens found');
        }
    }

    /**
     * Get authenticated API instance
     */
    getApiInstance() {
        return this.api;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.accessToken;
    }

    /**
     * Make an authenticated API call
     */
    async makeApiCall(endpoint, options = {}) {
        try {
            // Ensure we're authenticated
            if (!this.isAuthenticated()) {
                console.log('Not authenticated, initializing...');
                await this.initialize();
            }

            console.log('Making API call:', {
                endpoint,
                method: options.method || 'GET',
                baseURL: this.api.defaults.baseURL,
                hasData: !!options.data
            });

            // Use the configured axios instance which already handles auth
            const response = await this.api({
                url: endpoint,
                method: options.method || 'GET',
                data: options.data,
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            return response.data;

        } catch (error) {
            console.error('API call failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
                requestData: error.config?.data
            });
            throw error;
        }
    }
}

module.exports = SbuService;