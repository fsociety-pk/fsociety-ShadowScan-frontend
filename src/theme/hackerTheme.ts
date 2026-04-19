import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const hackerTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#00ff41', // Matrix / Neon green
    colorInfo: '#00ff41',
    colorSuccess: '#3fb950',
    colorWarning: '#d29922',
    colorError: '#f85149',
    colorBgBase: '#000000', // True black
    colorBgContainer: '#0d1117', // Slightly lighter dark
    colorBgElevated: '#161b22',
    colorTextBase: '#e6edf3',
    fontFamily: '"Fira Code", "Menlo", "Courier New", monospace', // Hacker feel
    borderRadius: 2, // Sharp edges
  },
  components: {
    Layout: {
      headerBg: '#010409',
      bodyBg: '#000000',
      footerBg: '#010409',
    },
    Card: {
      colorBorderSecondary: '#30363d',
      algorithm: true,
    },
    Button: {
      colorPrimary: '#00ff41',
      colorPrimaryHover: '#00c234',
      colorPrimaryActive: '#00a32b',
      primaryShadow: '0 0 10px rgba(0, 255, 65, 0.4)',
    }
  }
};
