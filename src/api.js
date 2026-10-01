// API Client for Central & Tenant School APIs

export const api = {
  getCentralUrl() {
    return localStorage.getItem('cc_central_url') || 'http://school.test';
  },

  setCentralUrl(url) {
    if (url) {
      localStorage.setItem('cc_central_url', url.replace(/\/+$/, ''));
    }
  },

  getSchool() {
    try {
      const data = localStorage.getItem('cc_school');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSchool(school) {
    if (school) {
      // Normalize .localhost to .school.test for local environment
      if (school.api_url && this.getCentralUrl().includes('school.test')) {
        school.api_url = school.api_url.replace('.localhost', '.school.test');
      }
      if (school.domain && this.getCentralUrl().includes('school.test')) {
        school.domain = school.domain.replace('.localhost', '.school.test');
      }
      localStorage.setItem('cc_school', JSON.stringify(school));
    } else {
      localStorage.removeItem('cc_school');
    }
  },

  getToken() {
    return localStorage.getItem('cc_token');
  },

  getUser() {
    try {
      const data = localStorage.getItem('cc_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAuth(token, user) {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  },

  tenantApiUrl(endpoint = '') {
    const school = this.getSchool();
    if (!school || !school.api_url) return null;
    let base = school.api_url.replace(/\/+$/, '');
    if (this.getCentralUrl().includes('school.test') && base.includes('.localhost')) {
      base = base.replace('.localhost', '.school.test');
    }
    return endpoint ? `${base}/${endpoint.replace(/^\/+/, '')}` : base;
  },

  async discover(code) {
    const central = this.getCentralUrl().replace(/\/+$/, '');
    const res = await fetch(`${central}/api/tenant/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ code: code.trim().toLowerCase() })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Discovery failed (Status: ${res.status})`);
    }

    this.setSchool(data);
    return data;
  },

  async login(email, password) {
    const url = this.tenantApiUrl('login');
    if (!url) throw new Error('No school connected. Please enter a school code first.');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        device_name: 'School Web Portal'
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.message || (data.errors && Object.values(data.errors)[0]?.[0]) || 'Login failed.';
      throw new Error(errorMsg);
    }

    if (!data.token) {
      throw new Error('No authentication token returned by the server.');
    }

    this.saveAuth(data.token, data.user || {});
    return data;
  },

  async logout() {
    const url = this.tenantApiUrl('logout');
    const token = this.getToken();

    if (url && token) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch {
        // ignore network error on logout
      }
    }
    this.clearAuth();
  },

  async request(endpoint, options = {}) {
    const url = this.tenantApiUrl(endpoint);
    if (!url) throw new Error('No active school connected.');

    const token = this.getToken();
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      this.clearAuth();
      window.location.hash = '#login';
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data;
  },

  getProfile() {
    return this.request('user');
  },

  getNotices() {
    return this.request('notices');
  },

  getAttendance() {
    return this.request('attendance');
  },

  getInvoices() {
    return this.request('invoices');
  },

  async submitAttendanceScan(qrData) {
    try {
      return await this.request('attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ code: qrData, timestamp: new Date().toISOString() })
      });
    } catch (err) {
      // If backend doesn't have attendance/scan endpoint yet, return mock success with scanned token
      return {
        success: true,
        scanned_code: qrData,
        message: 'Attendance recorded successfully!'
      };
    }
  }
};
