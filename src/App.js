import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import MainPage from './MainPage'
import GaojiSearch from './search/gaojiSearch'
import NotFoundPage from "./ErrorPages/NotFoundPage";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";


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
            {/* 404页面 */}
            <Route path="*" element={<NotFoundPage />} />
            {/* 500页面 */}
            <Route path="/500" element={<NotFoundPage />} />
            {/* 403页面 */}
            <Route path="/403" element={<ForbiddenPage />} />
        </Routes>
      </Router>
  )
}

export default App
