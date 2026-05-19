const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, fieldErrors, status) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors || {};
    this.status = status;
  }
}

const parseApiErrors = (data) => {
  const errors = {};

  const normalizeEntry = (field, messages) => {
    const normalizedField = field.replace(/\s+/g, '_').toLowerCase();
    errors[normalizedField] = Array.isArray(messages) ? messages : [messages];
  };

  const mapErrorToField = (errorMessage) => {
    const msg = errorMessage.toLowerCase();
    if (/email/i.test(msg)) return 'email';
    if (/phone|phone number|mobile/i.test(msg)) return 'phone_number';
    if (/password confirmation|confirm password/i.test(msg)) return 'password_confirmation';
    if (/password/i.test(msg)) return 'password';
    if (/first.?name/i.test(msg)) return 'first_name';
    if (/last.?name/i.test(msg)) return 'last_name';
    if (/middle.?name/i.test(msg)) return 'middle_name';
    if (/date.?of.?birth|dob/i.test(msg)) return 'dob';
    if (/employment.?status/i.test(msg)) return 'employment_status';
    return null;
  };

  if (data && typeof data === 'object') {
    if (Array.isArray(data.errors)) {
      data.errors.forEach((errorMessage) => {
        const fieldName = mapErrorToField(errorMessage);
        if (fieldName) {
          if (!errors[fieldName]) errors[fieldName] = [];
          errors[fieldName].push(errorMessage);
        } else {
          errors._error = [errorMessage];
        }
      });
    } else if (data.errors && typeof data.errors === 'object') {
      Object.entries(data.errors).forEach(([field, messages]) => normalizeEntry(field, messages));
    } else {
      const entries = Object.entries(data);
      const hasFieldKeys = entries.some(([key]) => key !== 'error' && key !== 'message' && key !== 'success');

      if (hasFieldKeys) {
        entries.forEach(([field, messages]) => {
          if (field === 'error' || field === 'message' || field === 'success') return;
          normalizeEntry(field, messages);
        });
      } else if (data.error || data.message) {
        const message = data.error || data.message;
        const fieldName = mapErrorToField(message);
        if (fieldName) {
          errors[fieldName] = [message];
        } else {
          errors._error = [message];
        }
      }
    }
  } else if (typeof data === 'string') {
    const fieldName = mapErrorToField(data);
    if (fieldName) {
      errors[fieldName] = [data];
    } else {
      errors._error = [data];
    }
  }

  return errors;
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : null;
  logMailFallback(data);

  if (!response.ok) {
    if (response.status === 401) {
      // Global 401 handling - clear token and maybe redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('seenhub_token');
        localStorage.removeItem('seenhub_user');
        localStorage.removeItem('seenhub_admin_token');
        localStorage.removeItem('seenhub_admin_user');
        
        const isAdminPath = window.location.pathname.startsWith('/admin');
        if (isAdminPath) {
          window.location.replace('/admin?expired=true');
        }
      }
    }

    const fieldErrors = parseApiErrors(data);
    const message = fieldErrors._error
      ? fieldErrors._error.join('. ')
      : Object.entries(fieldErrors).map(([field, messages]) => {
          const text = Array.isArray(messages) ? messages.join(', ') : messages;
          return `${field.replaceAll('_', ' ')} ${text}`;
        }).join('. ') || 'Something went wrong. Please try again.';

    throw new ApiError(message, fieldErrors, response.status);
  }

  return data;
};

const logMailFallback = (data) => {
  if (typeof window === 'undefined' || !data || typeof data !== 'object') return;

  const fallback = data.debug_mail_fallback;
  if (!fallback || !fallback.value) return;

  if (fallback.type === 'otp') {
    console.log('[SeenHub OTP fallback]', fallback.value);
    window.alert(`OTP: ${fallback.value}`);
    return;
  }

  if (fallback.type === 'verification_link') {
    console.log('[SeenHub verification link fallback]', fallback.value);
    window.alert(`Verification link:\n${fallback.value}`);
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const request = async (method, path, body = null, customHeaders = {}) => {
  const headers = {
    'Accept': 'application/json',
    ...customHeaders
  };

  // Automatically attach Content-Type for JSON payloads
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Automatically attach Authorization token if it exists
  if (typeof window !== 'undefined') {
    const isAdminPath = path.startsWith('/api/admin');
    const isCurrentAdminPath = window.location.pathname.startsWith('/admin');
    const adminToken = localStorage.getItem('seenhub_admin_token');
    const userToken = localStorage.getItem('seenhub_token');

    const token = (isAdminPath || isCurrentAdminPath) ? adminToken : (userToken || adminToken);

    // Bug 20 Fix: Client-side JWT expiry check before every request
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('seenhub_token');
      localStorage.removeItem('seenhub_user');
      localStorage.removeItem('seenhub_admin_token');
      localStorage.removeItem('seenhub_admin_user');
      
      const publicPaths = ['/', '/login', '/register'];
      const isCurrentAdminPath = window.location.pathname.startsWith('/admin');
      if (isCurrentAdminPath) {
        window.location.replace('/admin?expired=true');
      } else if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/?login=true&expired=true';
      }
      throw new ApiError('Session expired. Please log in again.', {}, 401);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return handleResponse(response);
};

export const apiClient = {
  get: (path, headers = {}) => request('GET', path, null, headers),
  post: (path, body, headers = {}) => request('POST', path, body, headers),
  put: (path, body, headers = {}) => request('PUT', path, body, headers),
  patch: (path, body, headers = {}) => request('PATCH', path, body, headers),
  delete: (path, headers = {}) => request('DELETE', path, null, headers),
};
