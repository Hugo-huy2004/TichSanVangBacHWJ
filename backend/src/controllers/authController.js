const axios = require('axios');
const User = require('../models/User');

const verifyGoogleIdToken = async (idToken) => {
  const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: idToken },
    timeout: 15000
  });

  const audience = process.env.GOOGLE_CLIENT_ID;

  if (audience && response.data.aud !== audience) {
    const error = new Error('Invalid Google client id');
    error.status = 401;
    throw error;
  }

  return response.data;
};

const verifyZaloAccessToken = async (accessToken) => {
  const response = await axios.get('https://graph.zalo.me/v2.0/me', {
    params: {
      access_token: accessToken,
      fields: 'id,name,picture'
    },
    timeout: 15000
  });

  if (!response.data?.id) {
    const error = new Error('Invalid Zalo access token');
    error.status = 401;
    throw error;
  }

  return response.data;
};

const buildProviderUserId = (provider, body) => {
  if (body.providerUserId) {
    return String(body.providerUserId);
  }

  if (body.email) {
    return `${provider}:${body.email}`;
  }

  return `${provider}:${body.displayName || 'anonymous'}`;
};

const login = async (request, response, next) => {
  try {
    const { provider, displayName, fullName, nickname, birthday, phone, address, email, avatarUrl, credential } = request.body;

    if (!provider) {
      return response.status(400).json({ message: 'provider is required' });
    }

    if (provider === 'google') {
      if (!credential) {
        return response.status(400).json({ message: 'Google credential is required' });
      }

      const tokenInfo = await verifyGoogleIdToken(credential);
      const providerUserId = tokenInfo.sub;
      const user = await User.findOneAndUpdate(
        { provider, providerUserId },
        {
          provider,
          providerUserId,
          displayName: tokenInfo.name || tokenInfo.email || 'Google User',
          fullName: tokenInfo.name || fullName || '',
          nickname: nickname || '',
          birthday: birthday || '',
          phone: phone || '',
          address: address || '',
          email: tokenInfo.email || email || '',
          avatarUrl: tokenInfo.picture || avatarUrl || ''
        },
        { new: true, upsert: true }
      );

      return response.json({
        id: `${provider}:${providerUserId}`,
        provider: user.provider,
        providerUserId: user.providerUserId,
        name: user.displayName,
        fullName: user.fullName || user.displayName,
        nickname: user.nickname || '',
        birthday: user.birthday || '',
        phone: user.phone || '',
        address: user.address || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      });
    }

    if (provider === 'zalo') {
      const accessToken = credential || request.body.accessToken;
      const requireZaloAccessToken = process.env.REQUIRE_ZALO_ACCESS_TOKEN === 'true';

      if (accessToken) {
        const tokenInfo = await verifyZaloAccessToken(accessToken);
        const providerUserId = tokenInfo.id;
        const tokenAvatar = typeof tokenInfo.picture === 'string'
          ? tokenInfo.picture
          : tokenInfo.picture?.data?.url;
        const user = await User.findOneAndUpdate(
          { provider, providerUserId },
          {
            provider,
            providerUserId,
            displayName: tokenInfo.name || displayName || 'Người dùng Zalo',
            fullName: fullName || tokenInfo.name || displayName || 'Người dùng Zalo',
            nickname: nickname || '',
            birthday: birthday || '',
            phone: phone || '',
            address: address || '',
            email: email || '',
            avatarUrl: tokenAvatar || avatarUrl || ''
          },
          { new: true, upsert: true }
        );

        return response.json({
          id: `${provider}:${providerUserId}`,
          provider: user.provider,
          providerUserId: user.providerUserId,
          name: user.displayName,
          fullName: user.fullName || user.displayName,
          nickname: user.nickname || '',
          birthday: user.birthday || '',
          phone: user.phone || '',
          address: user.address || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || ''
        });
      }

      if (requireZaloAccessToken) {
        return response.status(400).json({ message: 'Zalo access token is required' });
      }
    }

    if (!displayName) {
      return response.status(400).json({ message: 'displayName is required for non-Google providers' });
    }

    const providerUserId = buildProviderUserId(provider, request.body);
    const user = await User.findOneAndUpdate(
      { provider, providerUserId },
      {
        provider,
        providerUserId,
        displayName,
        fullName: fullName || displayName,
        nickname: nickname || '',
        birthday: birthday || '',
        phone: phone || '',
        address: address || '',
        email: email || '',
        avatarUrl: avatarUrl || ''
      },
      { new: true, upsert: true }
    );

    response.json({
      id: `${provider}:${providerUserId}`,
      provider: user.provider,
      providerUserId: user.providerUserId,
      name: user.displayName,
      fullName: user.fullName || user.displayName,
      nickname: user.nickname || '',
      birthday: user.birthday || '',
      phone: user.phone || '',
      address: user.address || '',
      email: user.email || '',
      avatarUrl: user.avatarUrl || ''
    });
  } catch (error) {
    next(error);
  }
};

const parseSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }

  const [provider, providerUserId] = sessionId.split(':');

  if (!provider || !providerUserId) {
    return null;
  }

  return { provider, providerUserId };
};

const updateProfile = async (request, response, next) => {
  try {
    const sessionId = request.headers['x-user-id'] || request.body.userId;
    const parsed = parseSessionId(sessionId);

    if (!parsed) {
      return response.status(400).json({ message: 'user session is required' });
    }

    const { displayName, fullName, nickname, birthday, phone, address, email, avatarUrl } = request.body;
    const user = await User.findOneAndUpdate(
      { provider: parsed.provider, providerUserId: parsed.providerUserId },
      {
        ...(displayName ? { displayName } : {}),
        ...(fullName !== undefined ? { fullName } : {}),
        ...(nickname !== undefined ? { nickname } : {}),
        ...(birthday !== undefined ? { birthday } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {})
      },
      { new: true }
    );

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    response.json({
      id: `${user.provider}:${user.providerUserId}`,
      provider: user.provider,
      providerUserId: user.providerUserId,
      name: user.displayName,
      fullName: user.fullName || user.displayName,
      nickname: user.nickname || '',
      birthday: user.birthday || '',
      phone: user.phone || '',
      address: user.address || '',
      email: user.email || '',
      avatarUrl: user.avatarUrl || ''
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, updateProfile };
