import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import MainPage from './MainPage'
import GaojiSearch from './search/gaojiSearch'


function App() {
  return (
      <Router>
        <Routes>
          {/* 登录页 */}
          <Route path="/" element={<LoginPage />} />

          {/* 主页面 */}
          <Route path="/main" element={
          <>
          <MainPage /></>
          } />

          {/* 高级搜索页 */}
          <Route path="/gaojiSearch" element={<GaojiSearch />} />
        </Routes>
      </Router>
  )
}

export default App
