import React from 'react'
import ReactDOM from 'react-dom/client'
import { App as AntdApp, ConfigProvider } from 'antd'
import App from './App'
import { hackerTheme } from './theme/hackerTheme'
import './index.css'

ConfigProvider.config({
  holderRender: (children) => (
    <ConfigProvider theme={hackerTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  ),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={hackerTheme}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
)
