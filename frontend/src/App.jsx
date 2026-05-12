import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import Dashboard from './pages/Dashboard';
import { normalizePricePayload } from './lib/market';
import { readStoredValue, writeStoredValue } from './lib/storage';
import { createAsset as createAssetRequest, createPrice as createPriceRequest, deleteAsset as deleteAssetRequest, deletePrice as deletePriceRequest, loadBootstrap, loginGoogleUser, loginUser, updateProfile } from './lib/api';

const authKey = 'tichtru.session';

const enrichAsset = (asset, prices) => {
  const currentPrice = prices.find((price) => price.name === asset.providerName)?.sell || 0;
  const totalCost = (asset.purchasePrice * asset.weight) + (asset.laborCost || 0);
  const currentValue = currentPrice * asset.weight;
  const profit = currentValue - totalCost;
  const percent = totalCost ? (profit / totalCost) * 100 : 0;

  return {
    ...asset,
    currentPrice,
    totalCost,
    currentValue,
    profit,
    percent
  };
};

const App = () => {
  const [session, setSession] = useState(() => readStoredValue(authKey, null));
  const [marketPrices, setMarketPrices] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => writeStoredValue(authKey, session), [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;

    const syncFromBackend = async () => {
      try {
        const snapshot = await loadBootstrap(session.id);
        if (!isMounted) {
          return;
        }

        setMarketPrices(snapshot.prices?.length ? snapshot.prices : []);
        setAssets(snapshot.assets || []);
      } catch {
        // Keep the current in-memory state when the backend is unavailable.
      }
    };

    syncFromBackend();
    const timer = window.setInterval(syncFromBackend, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    const refreshRemotePrices = async () => {
      const apiSources = marketPrices.filter((price) => price.apiUrl);

      if (!apiSources.length) {
        return;
      }

      const refreshed = await Promise.all(apiSources.map(async (price) => {
        try {
          const response = await fetch(price.apiUrl);
          const payload = await response.json();
          const normalized = normalizePricePayload(payload, price.name, price.type);

          return {
            ...price,
            buy: normalized.buy || price.buy,
            sell: normalized.sell || price.sell,
            updatedAt: new Date().toISOString()
          };
        } catch {
          return price;
        }
      }));

      if (!isMounted) {
        return;
      }

      setMarketPrices((current) => current.map((price) => refreshed.find((item) => item.id === price.id) || price));
    };

    refreshRemotePrices();
    const timer = window.setInterval(refreshRemotePrices, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [marketPrices]);

  const enrichedAssets = useMemo(() => assets.map((asset) => enrichAsset(asset, marketPrices)), [assets, marketPrices]);

  const summary = useMemo(() => enrichedAssets.reduce((accumulator, asset) => {
    accumulator.profit += asset.profit;
    accumulator.costBasis += asset.totalCost;
    accumulator.portfolioValue += asset.currentValue;
    return accumulator;
  }, { profit: 0, costBasis: 0, portfolioValue: 0 }), [enrichedAssets]);

  const handleLogin = useCallback(async (provider, payload = {}) => {
    const displayName = payload.displayName || (provider === 'zalo' ? 'Người dùng Zalo' : 'Người dùng Google');

    try {
      if (provider === 'google' && payload.credential) {
        const user = await loginGoogleUser(payload.credential);
        setSession(user);
        return;
      }

      const user = await loginUser(provider, {
        displayName,
        fullName: payload.fullName || displayName,
        nickname: payload.nickname || '',
        birthday: payload.birthday || '',
        phone: payload.phone || '',
        address: payload.address || '',
        email: payload.email || '',
        avatarUrl: payload.avatarUrl || '',
        providerUserId: payload.providerUserId || '',
        accessToken: payload.accessToken || ''
      });
      setSession(user);
      return;
    } catch {
      setSession({
        id: `${provider}-${Date.now()}`,
        name: displayName,
        provider
      });
    }
  }, []);

  const handleAddPrice = async (input) => {
    const payload = {
      name: input.name,
      type: input.type,
      buy: Number(input.buy) || 0,
      sell: Number(input.sell) || 0,
      apiUrl: input.apiUrl || ''
    };

    const price = await createPriceRequest(session.id, payload);
    setMarketPrices((current) => [...current.filter((item) => item.id !== price.id), price]);
  };

  const handleAddAsset = async (input) => {
    const payload = {
      providerName: input.providerName,
      assetType: input.assetType,
      purchaseDate: input.purchaseDate,
      purchasePrice: Number(input.purchasePrice),
      laborCost: Number(input.laborCost) || 0,
      weight: Number(input.weight),
      note: input.note || ''
    };

    const asset = await createAssetRequest(session.id, payload);
    setAssets((current) => [...current.filter((item) => item.id !== asset.id), asset]);
  };

  const handleUpdateProfile = async (input) => {
    const updated = await updateProfile(session.id, {
      displayName: input.fullName || input.displayName || input.nickname || session.name,
      fullName: input.fullName,
      nickname: input.nickname,
      birthday: input.birthday,
      phone: input.phone,
      address: input.address,
      email: input.email
    });
    setSession(updated);
  };

  const buildReportWindow = (title, rows) => {
    const reportWindow = window.open('', '_blank', 'width=980,height=820');

    if (!reportWindow) {
      return;
    }

    reportWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 32px; color: #2d2d2d; }
            h1 { font-size: 28px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border-bottom: 1px solid #2d2d2d; padding: 10px 12px; text-align: left; font-size: 14px; }
            th { background: #fff9e8; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Tổng vốn: ${summary.costBasis.toLocaleString('vi-VN')} VND</p>
          <p>Giá trị hiện tại: ${summary.portfolioValue.toLocaleString('vi-VN')} VND</p>
          <p>Lời/lỗ: ${summary.profit.toLocaleString('vi-VN')} VND</p>
          <table>
            <thead>
              <tr>
                <th>Doanh nghiệp</th>
                <th>Loại</th>
                <th>Ngày mua</th>
                <th>Giá mua</th>
                <th>Tiền công</th>
                <th>Khối lượng</th>
                <th>Lời/lỗ</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((asset) => `
                <tr>
                  <td>${asset.providerName}</td>
                  <td>${asset.assetType === 'Gold' ? 'Vàng' : 'Bạc'}</td>
                  <td>${new Date(asset.purchaseDate).toLocaleDateString('vi-VN')}</td>
                  <td>${Number(asset.purchasePrice).toLocaleString('vi-VN')} VND</td>
                  <td>${Number(asset.laborCost || 0).toLocaleString('vi-VN')} VND</td>
                  <td>${asset.weight} chỉ</td>
                  <td>${Number(asset.profit).toLocaleString('vi-VN')} VND</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const handleExportReport = (scope) => {
    const filteredAssets = scope === 'Gold'
      ? enrichedAssets.filter((asset) => asset.assetType === 'Gold')
      : scope === 'Silver'
        ? enrichedAssets.filter((asset) => asset.assetType === 'Silver')
        : enrichedAssets;

    const title = scope === 'all' ? 'Báo cáo tài sản' : `Báo cáo ${scope}`;
    buildReportWindow(title, filteredAssets);
  };

  const handleRemovePrice = (id) => {
    Promise.resolve(deletePriceRequest(session.id, id)).catch(() => null);
    setMarketPrices((current) => current.filter((price) => price.id !== id));
  };

  const handleRemoveAsset = (id) => {
    Promise.resolve(deleteAssetRequest(session.id, id)).catch(() => null);
    setAssets((current) => current.filter((asset) => asset.id !== id));
  };

  if (!session) {
    return <AuthPanel onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      session={session}
      profile={session}
      marketPrices={marketPrices}
      assets={enrichedAssets}
      summary={summary}
      onAddPrice={handleAddPrice}
      onRemovePrice={handleRemovePrice}
      onAddAsset={handleAddAsset}
      onRemoveAsset={handleRemoveAsset}
      onUpdateProfile={handleUpdateProfile}
      onExportReport={handleExportReport}
      onSignOut={() => setSession(null)}
    />
  );
};

export default App;
