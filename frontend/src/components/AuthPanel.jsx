import React, { useEffect, useRef, useState } from 'react';
import { getZaloMiniAppProfile } from '../lib/zaloMiniApp';

const providers = [
  {
    key: 'google',
    title: 'Đăng nhập Google',
    description: 'Đăng nhập thật qua Google Identity Services.'
  },
  {
    key: 'zalo',
    title: 'Đăng nhập Zalo Mini App',
    description: 'Cần Zalo Mini App SDK và token riêng của Zalo.'
  }
];

const loadGoogleScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve(window.google);
    return;
  }

  const existing = document.querySelector('script[data-google-identity="true"]');

  if (existing) {
    existing.addEventListener('load', () => resolve(window.google));
    existing.addEventListener('error', reject);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.dataset.googleIdentity = 'true';
  script.onload = () => resolve(window.google);
  script.onerror = reject;
  document.head.appendChild(script);
});

const decodeGoogleCredential = (credential) => {
  try {
    const payload = credential.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return {};
  }
};

const AuthPanel = ({ onLogin }) => {
  const googleButtonRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [zaloError, setZaloError] = useState('');
  const [zaloLoading, setZaloLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setGoogleError('Thiếu VITE_GOOGLE_CLIENT_ID trong frontend/.env');
      return () => {
        isMounted = false;
      };
    }

    loadGoogleScript()
      .then((google) => {
        if (!isMounted) {
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const profile = decodeGoogleCredential(response.credential);
            await onLogin('google', {
              credential: response.credential,
              displayName: profile.name,
              email: profile.email,
              avatarUrl: profile.picture,
              providerUserId: profile.sub
            });
          }
        });

        if (googleButtonRef.current) {
          google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320
          });
        }

        setGoogleReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setGoogleError('Không tải được Google Identity Services.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onLogin]);

  return (
    <section className="auth-panel">
      <div className="auth-card auth-card--split">
        <div className="auth-hero-copy">
          <div className="eyebrow">TichTru</div>
          <h1>Quản lý vàng bạc bằng giao diện sạch, sáng và rất dễ đọc.</h1>
          <p>
            Tập trung vào bảng giá, tài sản và tài khoản cá nhân. Mọi thứ được tối ưu cho laptop, iPad và desktop với bố cục ít nhiễu.
          </p>
          <div className="auth-highlights">
            <div>
              <span>01</span>
              <strong>Đăng nhập riêng tư</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Bảng giá chia sẻ</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Tài sản + lời lỗ</strong>
            </div>
          </div>
        </div>

        <div className="auth-panel-card">
          <div className="auth-panel-card__header">
            <div>
              <span className="auth-panel-card__eyebrow">Đăng nhập</span>
              <h2>Chọn phương thức</h2>
            </div>
            <span className="auth-panel-card__badge">Private</span>
          </div>

          <div className="auth-actions auth-actions--stacked">
            <div className="auth-button auth-button--google">
              <span>{providers[0].title}</span>
              <small>{providers[0].description}</small>
              <div ref={googleButtonRef} className="google-button-slot" />
              {googleError ? <small className="auth-error">{googleError}</small> : null}
              {!googleError && !googleReady ? <small>Đang tải nút đăng nhập Google...</small> : null}
            </div>
            <button
              type="button"
              className="auth-button auth-button--zalo"
              disabled={zaloLoading}
              onClick={async () => {
                setZaloError('');
                setZaloLoading(true);

                try {
                  const profile = await getZaloMiniAppProfile();
                  await onLogin('zalo', profile);
                } catch (error) {
                  setZaloError(error.message || 'Không đăng nhập được bằng Zalo Mini App.');
                } finally {
                  setZaloLoading(false);
                }
              }}
            >
              <span>{providers[1].title}</span>
              <small>{zaloLoading ? 'Đang lấy thông tin từ Zalo...' : providers[1].description}</small>
              {zaloError ? <small className="auth-error">{zaloError}</small> : null}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPanel;
