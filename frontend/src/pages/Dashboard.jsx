import React, { useEffect, useMemo, useState } from 'react';
import PriceForm from '../components/PriceForm';
import PriceTable from '../components/PriceTable';
import AssetForm from '../components/AssetForm';
import PortfolioTable from '../components/PortfolioTable';
import { formatMoney } from '../lib/format';
import { CloseIcon, EditIcon, ExportIcon, LogoutIcon, PlusIcon, TabIcon } from '../components/Icons';

const tabs = [
  { id: 'prices', label: 'GIÁ VÀNG/BẠC' },
  { id: 'assets', label: 'TÀI SẢN' },
  { id: 'account', label: 'TÀI KHOẢN' }
];

const Dashboard = ({ session, profile, marketPrices, assets, summary, onAddPrice, onRemovePrice, onAddAsset, onRemoveAsset, onUpdateProfile, onExportReport, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('prices');
  const [activeModal, setActiveModal] = useState(null);
  const [accountModal, setAccountModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.fullName || profile?.name || session.name || '',
    nickname: profile?.nickname || '',
    birthday: profile?.birthday || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    email: profile?.email || session.email || ''
  });

  useEffect(() => {
    setProfileForm({
      fullName: profile?.fullName || profile?.name || session.name || '',
      nickname: profile?.nickname || '',
      birthday: profile?.birthday || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      email: profile?.email || session.email || ''
    });
  }, [profile?.fullName, profile?.name, profile?.nickname, profile?.birthday, profile?.phone, profile?.address, profile?.email, session.name, session.email]);

  const priceStats = useMemo(() => ({
    goldCount: marketPrices.filter((price) => price.type === 'Gold').length,
    silverCount: marketPrices.filter((price) => price.type === 'Silver').length
  }), [marketPrices]);

  const closeModal = () => setActiveModal(null);

  const submitPrice = async (input) => {
    await onAddPrice(input);
    closeModal();
  };

  const submitAsset = async (input) => {
    await onAddAsset(input);
    closeModal();
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    await onUpdateProfile(profileForm);
    setAccountModal(false);
  };

  const openAccountModal = () => setAccountModal(true);
  const closeAccountModal = () => setAccountModal(false);

  return (
    <main className="dashboard-shell">
      <header className="global-nav">
        <div className="global-nav__brand">TichTru</div>
        <nav className="global-nav__links" aria-label="Chuyển tab">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'tab-link tab-link--active' : 'tab-link'} onClick={() => setActiveTab(tab.id)}>
              <TabIcon kind={tab.id} className="button-icon button-icon--tab" />
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="button-dark-utility" onClick={onSignOut} aria-label="Đăng xuất">
          <LogoutIcon className="button-icon button-icon--inline" />
          <span>Đăng xuất</span>
        </button>
      </header>

      <section className="sub-nav-frosted">
        <div>
          <strong>{session.name}</strong>
          <span>Quản lý vàng bạc cá nhân</span>
        </div>
        <div className="sub-nav-frosted__stats">
          <span>{priceStats.goldCount + priceStats.silverCount} theo dõi</span>
          <span>{priceStats.goldCount} vàng</span>
          <span>{priceStats.silverCount} bạc</span>
          <span>{assets.length} tài sản</span>
          <span>{formatMoney(summary.portfolioValue)}</span>
        </div>
        <div className="tile-actions">
          {activeTab === 'prices' ? <button className="icon-button icon-button--add" onClick={() => setActiveModal('price')} aria-label="Thêm giá"><PlusIcon className="button-icon" /></button> : null}
          {activeTab === 'assets' ? <button className="icon-button icon-button--add" onClick={() => setActiveModal('asset')} aria-label="Thêm tài sản"><PlusIcon className="button-icon" /></button> : null}
        </div>
      </section>

      {activeTab === 'prices' ? (
        <section className="product-tile-light tab-panel">
          <div className="panel-heading">
            <h2>Giá vàng/bạc hôm nay</h2>
            <button className="icon-button icon-button--add" onClick={() => setActiveModal('price')} aria-label="Thêm giá"><PlusIcon className="button-icon" /></button>
          </div>
          <PriceTable prices={marketPrices} onRemove={onRemovePrice} compact />
        </section>
      ) : null}

      {activeTab === 'assets' ? (
        <section className="product-tile-parchment tab-panel">
          <div className="panel-heading">
            <h2>Tài sản</h2>
            <button className="icon-button icon-button--add" onClick={() => setActiveModal('asset')} aria-label="Thêm tài sản"><PlusIcon className="button-icon" /></button>
          </div>
          <PortfolioTable assets={assets} onRemove={onRemoveAsset} compact />
        </section>
      ) : null}

      {activeTab === 'account' ? (
        <section className="product-tile-dark account-grid tab-panel">
          <div className="store-utility-card">
            <h2>Tài khoản cá nhân</h2>
            <p>Họ tên, biệt danh, sinh nhật, SĐT, địa chỉ và email đều nằm trong một pop-up ngắn gọn.</p>
            <div className="account-summary-grid">
              <div><span>Họ và tên</span><strong>{profileForm.fullName || 'Chưa nhập'}</strong></div>
              <div><span>Biệt danh</span><strong>{profileForm.nickname || 'Chưa nhập'}</strong></div>
              <div><span>Sinh nhật</span><strong>{profileForm.birthday || 'Chưa nhập'}</strong></div>
              <div><span>Số điện thoại</span><strong>{profileForm.phone || 'Chưa nhập'}</strong></div>
              <div><span>Địa chỉ</span><strong>{profileForm.address || 'Chưa nhập'}</strong></div>
              <div><span>Gmail/Email</span><strong>{profileForm.email || 'Chưa nhập'}</strong></div>
            </div>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={openAccountModal} aria-label="Chỉnh sửa tài khoản">
                <EditIcon className="button-icon button-icon--inline" />
                <span>Edit</span>
              </button>
              <button className="primary-button" type="button" onClick={() => onExportReport('all')} aria-label="Xuất PDF">
                <ExportIcon className="button-icon button-icon--inline" />
                <span>Xuất PDF</span>
              </button>
            </div>
          </div>

          <div className="store-utility-card">
            <h2>Thống kê</h2>
            <div className="account-stats">
              <div><span>Đã bỏ ra</span><strong>{formatMoney(summary.costBasis)}</strong></div>
              <div><span>Hiện tại thực tế</span><strong>{formatMoney(summary.portfolioValue)}</strong></div>
              <div><span>Lời / lỗ</span><strong className={summary.profit >= 0 ? 'positive' : 'negative'}>{summary.profit >= 0 ? '+' : ''}{formatMoney(summary.profit)}</strong></div>
              <div><span>Số tài sản</span><strong>{assets.length}</strong></div>
            </div>
            <div className="export-actions">
              <button className="secondary-button" type="button" onClick={() => onExportReport('all')} aria-label="Xuất toàn bộ">
                <ExportIcon className="button-icon button-icon--inline" />
                <span>All</span>
              </button>
              <button className="secondary-button" type="button" onClick={() => onExportReport('Gold')} aria-label="Xuất vàng">
                <ExportIcon className="button-icon button-icon--inline" />
                <span>Vàng</span>
              </button>
              <button className="secondary-button" type="button" onClick={() => onExportReport('Silver')} aria-label="Xuất bạc">
                <ExportIcon className="button-icon button-icon--inline" />
                <span>Bạc</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeModal ? (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div className="modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button className="modal-close" type="button" onClick={closeModal} aria-label="Đóng"><CloseIcon className="button-icon" /></button>
            {activeModal === 'price' ? (
              <PriceForm onSubmit={submitPrice} onClose={closeModal} />
            ) : (
              <AssetForm providers={marketPrices} onSubmit={submitAsset} onClose={closeModal} />
            )}
          </div>
        </div>
      ) : null}

      {accountModal ? (
        <div className="modal-backdrop" onClick={closeAccountModal} role="presentation">
          <div className="modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button className="modal-close" type="button" onClick={closeAccountModal} aria-label="Đóng"><CloseIcon className="button-icon" /></button>
            <form className="panel form-grid" onSubmit={submitProfile}>
              <div className="panel-heading">
                <h2>Chỉnh sửa tài khoản</h2>
                <span>Google sẽ tự điền Gmail/Email, Zalo có thể điền SĐT nếu có.</span>
              </div>
              <label>
                Họ và tên
                <input value={profileForm.fullName} onChange={(event) => setProfileForm({ ...profileForm, fullName: event.target.value })} />
              </label>
              <label>
                Biệt danh
                <input value={profileForm.nickname} onChange={(event) => setProfileForm({ ...profileForm, nickname: event.target.value })} />
              </label>
              <label>
                Sinh nhật
                <input type="date" value={profileForm.birthday} onChange={(event) => setProfileForm({ ...profileForm, birthday: event.target.value })} />
              </label>
              <label>
                Số điện thoại
                <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Tự nhập nếu login Google" />
              </label>
              <label className="full-width">
                Địa chỉ
                <input value={profileForm.address} onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })} />
              </label>
              <label className="full-width">
                Gmail/Email
                <input value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} placeholder="Tự điền nếu login Google" />
              </label>
              <div className="form-actions full-width">
                <button className="secondary-button" type="button" onClick={closeAccountModal} aria-label="Hủy chỉnh sửa">
                  <CloseIcon className="button-icon button-icon--inline" />
                  <span>Hủy</span>
                </button>
                <button className="primary-button" type="submit" aria-label="Lưu tài khoản">
                  <ExportIcon className="button-icon button-icon--inline" />
                  <span>Lưu tài khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default Dashboard;