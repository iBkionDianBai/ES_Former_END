import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import MainPage from './MainPage'
import NewSearchPage1 from './search/newSearch1'
import GaojiSearch from './search/gaojiSearch'
import NewSearchPage3 from './search/newSearch3'
import NewSearchPage4 from './search/newSearch4'
import NewSearchPage5 from './search/newSearch5'
// import PrivateRoute from "./routers/privateRoute";



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
