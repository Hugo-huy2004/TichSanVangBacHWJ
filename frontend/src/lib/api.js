const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const request = async (path, { method = 'GET', body, userId } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const loginUser = (provider, payloadOrDisplayName) => {
  const payload = typeof payloadOrDisplayName === 'string'
    ? { displayName: payloadOrDisplayName }
    : (payloadOrDisplayName || {});

  return request('/api/auth/login', {
    method: 'POST',
    body: {
      provider,
      displayName: payload.displayName || '',
      fullName: payload.fullName || payload.displayName || '',
      nickname: payload.nickname || '',
      birthday: payload.birthday || '',
      phone: payload.phone || '',
      address: payload.address || '',
      email: payload.email || '',
      avatarUrl: payload.avatarUrl || '',
      providerUserId: payload.providerUserId || `${provider}:${payload.displayName || ''}`,
      accessToken: payload.accessToken || ''
    }
  });
};

export const loginGoogleUser = (credential) => request('/api/auth/login', {
  method: 'POST',
  body: {
    provider: 'google',
    credential
  }
});

export const updateProfile = (userId, payload) => request('/api/auth/profile', {
  method: 'PUT',
  userId,
  body: payload
});

export const loadBootstrap = async (userId) => {
  const [prices, assets] = await Promise.all([
    request('/api/prices/bootstrap', { userId }),
    request('/api/assets/bootstrap', { userId })
  ]);

  return { prices, assets };
};

export const createPrice = (userId, payload) => request('/api/prices', {
  method: 'POST',
  userId,
  body: payload
});

export const deletePrice = (userId, priceId) => request(`/api/prices/${priceId}`, {
  method: 'DELETE',
  userId
});

export const createAsset = (userId, payload) => request('/api/assets', {
  method: 'POST',
  userId,
  body: payload
});

export const deleteAsset = (userId, assetId) => request(`/api/assets/${assetId}`, {
  method: 'DELETE',
  userId
});
