import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const hackerTheme: ThemeConfig = {
  // *** LIGHT ALGORITHM — fixes ALL black box artifacts ***
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0ea5e9',
    colorInfo: '#8b5cf6',
    colorSuccess: '#52c41a',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',

    // Light backgrounds — was the root cause of black boxes
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgSpotlight: '#f1f5f9',

    // Dark readable text on white
    colorTextBase: '#0f172a',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',

    // Border
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorSplit: '#e2e8f0',

    // Links
    colorLink: '#0ea5e9',
    colorLinkHover: '#8b5cf6',
    colorLinkActive: '#0ea5e9',

    fontFamily: '"Space Grotesk", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
  },
  components: {
    Layout: {
      headerBg: 'rgba(255, 255, 255, 0.85)',
      bodyBg: '#f8fafc',
      footerBg: '#ffffff',
      headerHeight: 72,
      siderBg: '#ffffff',
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e2e8f0',
      borderRadiusLG: 16,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    },
    Button: {
      colorPrimary: '#0ea5e9',
      colorPrimaryHover: '#0284c7',
      colorPrimaryActive: '#0369a1',
      colorBgContainer: '#ffffff',
      borderRadius: 10,
      controlHeight: 42,
      fontWeight: 600,
      defaultBg: '#ffffff',
      defaultColor: '#0f172a',
      defaultBorderColor: '#e2e8f0',
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      colorText: '#0f172a',
      colorTextPlaceholder: '#94a3b8',
      colorPrimaryHover: '#0ea5e9',
      activeBorderColor: '#0ea5e9',
      activeShadow: '0 0 0 3px rgba(14, 165, 233, 0.15)',
      borderRadius: 10,
      controlHeight: 44,
    },
    Select: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorText: '#0f172a',
      colorBorder: '#e2e8f0',
      borderRadius: 10,
      controlHeight: 44,
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: 'rgba(14, 165, 233, 0.05)',
      headerColor: '#0ea5e9',
      rowHoverBg: 'rgba(14, 165, 233, 0.04)',
      borderColor: '#e2e8f0',
    },
    Tabs: {
      colorBgContainer: '#ffffff',
      inkBarColor: '#0ea5e9',
      itemActiveColor: '#0ea5e9',
      itemSelectedColor: '#0ea5e9',
      itemHoverColor: '#0ea5e9',
      cardBg: '#f8fafc',
    },
    Progress: {
      colorInfo: '#0ea5e9',
      colorSuccess: '#52c41a',
    },
    Menu: {
      colorBgContainer: '#ffffff',
      colorText: '#64748b',
      itemSelectedBg: 'rgba(14, 165, 233, 0.08)',
      itemSelectedColor: '#0ea5e9',
      itemHoverBg: 'rgba(14, 165, 233, 0.04)',
      itemHoverColor: '#0ea5e9',
    },
    Modal: {
      colorBgElevated: '#ffffff',
      contentBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Dropdown: {
      colorBgElevated: '#ffffff',
    },
    Collapse: {
      colorBgContainer: '#ffffff',
      headerBg: '#f8fafc',
    },
    Tag: {
      colorText: '#0f172a',
    },
    List: {
      colorSplit: '#e2e8f0',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 30,
    },
  }
};

// CSS Variables (kept for legacy compatibility)
export const shadowScanColors = {
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#52c41a',
  error: '#ef4444',
  warning: '#f59e0b',
  dark: '#0f172a',
  darkCard: '#ffffff',
  darkElevated: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  borderBright: 'rgba(14, 165, 233, 0.4)',
};
