import React from 'react';

export const PlusIcon = ({ className = '', title = 'Thêm' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <title>{title}</title>
    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ className = '', title = 'Đóng' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <title>{title}</title>
    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LogoutIcon = ({ className = '', title = 'Đăng xuất' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <title>{title}</title>
    <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7l5 5-5 5M20 12H9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EditIcon = ({ className = '', title = 'Chỉnh sửa' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <title>{title}</title>
    <path d="M4 20h4l10.5-10.5a1.7 1.7 0 0 0 0-2.4l-2-2a1.7 1.7 0 0 0-2.4 0L4 15.2V20Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ExportIcon = ({ className = '', title = 'Xuất' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <title>{title}</title>
    <path d="M12 4v10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 18h14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TabIcon = ({ kind, className = '' }) => {
  if (kind === 'prices') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 18h16M6 18V8l4-3 4 4 4-2v11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'assets') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 20h16M6 20v-8h3v8M11 20v-12h3v12M16 20v-5h3v5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 20V10l5-5 5 5v10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
