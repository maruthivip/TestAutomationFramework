import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, AuthToken } from '@/types/healthcare.types';
import { getCurrentEnvironment } from '@/config/environments';

export class RestApiClient {
  private client: AxiosInstance;
  private authToken: AuthToken | null = null;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || getCurrentEnvironment().apiBaseUrl;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'UHC-GPS-Automation-Framework/1.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        if (this.authToken) {
          config.headers.Authorization = `${this.authToken.tokenType} ${this.authToken.accessToken}`;
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = 0;
        console.log(`[API Response] ${response.status} ${response.config.url} (${duration}ms)`);
        return response;
      },
      async (error) => {
        const duration = 0;
        console.error(`[API Error] ${error.response?.status || 'Network Error'} ${error.config?.url} (${duration}ms)`);
        
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && this.authToken?.refreshToken) {
          try {
            await this.refreshToken();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            console.error('[Token Refresh Failed]', refreshError);
            this.authToken = null;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with OAuth2
   */
  async authenticate(clientId: string, clientSecret: string, scope?: string): Promise<AuthToken> {
    const environment = getCurrentEnvironment();
    
    try {
      const response = await axios.post(environment.auth.oauth2.tokenUrl, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope || environment.auth.oauth2.scope
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.authToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in,
        scope: response.data.scope
      };

      console.log('[Authentication] Successfully authenticated');
      return this.authToken;
    } catch (error) {
      console.error('[Authentication Error]', error);
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  /**
   * Authenticate with username and password
   */
  async authenticateWithPassword(username: string, password: string): Promise<AuthToken> {
    const environment = getCurrentEnvironment();
    
    try {
      const response = await axios.post(environment.auth.oauth2.tokenUrl, {
        grant_type: 'password',
        username: username,
        password: password,
        client_id: environment.auth.oauth2.clientId,
        scope: environment.auth.oauth2.scope
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.authToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in,
        scope: response.data.scope
      };

      console.log('[Authentication] Successfully authenticated with password');
      return this.authToken;
    } catch (error) {
      console.error('[Authentication Error]', error);
      throw new Error(`Password authentication failed: ${error}`);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthToken> {
    if (!this.authToken?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const environment = getCurrentEnvironment();
    
    try {
      const response = await axios.post(environment.auth.oauth2.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: this.authToken.refreshToken,
        client_id: environment.auth.oauth2.clientId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.authToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || this.authToken.refreshToken,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in,
        scope: response.data.scope
      };

      console.log('[Token Refresh] Successfully refreshed token');
      return this.authToken;
    } catch (error) {
      console.error('[Token Refresh Error]', error);
      throw new Error(`Token refresh failed: ${error}`);
    }
  }

  /**
   * Set authentication token manually
   */
  setAuthToken(token: AuthToken): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Upload file
   */
  async uploadFile<T>(url: string, file: File | Buffer, fieldName: string = 'file', additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return this.formatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Download file
   */
  async downloadFile(url: string, config?: AxiosRequestConfig): Promise<Buffer> {
    try {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('[File Download Error]', error);
      throw error;
    }
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers, headers);
  }

  /**
   * Set timeout
   */
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  /**
   * Format successful response
   */
  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      timestamp: new Date(),
      requestId: response.headers['x-request-id'] || this.generateRequestId()
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse<T>(error: any): ApiResponse<T> {
    const apiError: ApiError = {
      code: error.response?.status?.toString() || 'NETWORK_ERROR',
      message: error.response?.data?.message || error.message || 'Unknown error occurred',
      details: error.response?.data || {}
    };

    return {
      success: false,
      error: apiError,
      timestamp: new Date(),
      requestId: error.response?.headers['x-request-id'] || this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): AuthToken | null {
    return this.authToken;
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Create a new instance with different base URL
   */
  createInstance(baseURL: string): RestApiClient {
    const instance = new RestApiClient(baseURL);
    if (this.authToken) {
      instance.setAuthToken(this.authToken);
    }
    return instance;
  }
}

// Export singleton instance
export const apiClient = new RestApiClient();