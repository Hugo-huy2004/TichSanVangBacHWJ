const isDefaultAccessToken = (token) => !token || token === 'DEFAULT ACCESS TOKEN';

const loadZaloApis = async () => {
  try {
    return await import('zmp-sdk/apis');
  } catch {
    throw new Error('Zalo Mini App SDK chưa sẵn sàng. Hãy mở ứng dụng trong Zalo hoặc chạy bằng zmp start.');
  }
};

export const getZaloMiniAppProfile = async () => {
  const { getAccessToken, getUserID, getUserInfo } = await loadZaloApis();

  const [accessTokenResult, userIdResult, userInfoResult] = await Promise.allSettled([
    getAccessToken(),
    getUserID(),
    getUserInfo({ avatarType: 'normal', autoRequestPermission: true })
  ]);

  const accessToken = accessTokenResult.status === 'fulfilled' ? accessTokenResult.value : '';
  const userId = userIdResult.status === 'fulfilled' ? userIdResult.value : '';
  const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value?.userInfo : null;
  const providerUserId = userInfo?.id || userId;

  if (!providerUserId) {
    throw new Error('Không lấy được Zalo user ID. Vui lòng mở app trong Zalo và cấp quyền thông tin người dùng.');
  }

  return {
    providerUserId,
    displayName: userInfo?.name || 'Người dùng Zalo',
    fullName: userInfo?.name || 'Người dùng Zalo',
    avatarUrl: userInfo?.avatar || '',
    accessToken: isDefaultAccessToken(accessToken) ? '' : accessToken
  };
};
