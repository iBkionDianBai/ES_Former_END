import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './page/LoginPage'
import MainPage from './page/MainPage'
import GaojiSearch from './search/gaojiSearch'
import NotFoundPage from "./ErrorPages/NotFoundPage";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import SearchResultPage from './search/SearchResultPage';
import GaojiSearchResultPage from './search/GaojiSearchResultPage';
import ServerErrorPage from "./ErrorPages/ServerErrorPage";
import ContentViewerPage from "./page/ContentViewerPage";
import UploadFilePage from "./page/UploadFilePage";
import { useTranslation } from 'react-i18next';


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
            <Route path="/500" element={<ServerErrorPage />} />
            {/* 403页面 */}
            <Route path="/403" element={<ForbiddenPage />} />
            {/* 搜索结果页 */}
            <Route path="/searchResult" element={<SearchResultPage />} />
            {/* 高级搜索结果页 */}
            <Route path="/gaojiSearchResult" element={<GaojiSearchResultPage />} />
            {/* 内容展示页 */}
            <Route path="/contentViewer" element={<ContentViewerPage />} />
            {/*  上传文件页面  */}
            <Route path="/uploadFile" element={<UploadFilePage />} />
        </Routes>
      </Router>
  )
}

export default App
