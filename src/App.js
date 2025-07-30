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
import UploadFilePage from "./page/FileUploadPage";
import CookieNotice from "./CookieNotice/CookieNotice";
import AuthGuard from "./AuthGuard/AuthGuard";


function App() {
  return (
      <div>
        <CookieNotice/>
        <Router>
          <Routes>
            {/* 登录页 */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 受保护的主页面 */}
            <Route
                path="/main"
                element={
                  <AuthGuard>
                    <MainPage />
                  </AuthGuard>
                }
            />

            {/* 受保护的高级搜索页 */}
            <Route
                path="/gaojiSearch"
                element={
                  <AuthGuard>
                    <GaojiSearch />
                  </AuthGuard>
                }
            />

            {/* 404页面 */}
            <Route path="*" element={<NotFoundPage />} />
            {/* 500页面 */}
            <Route path="/500" element={<ServerErrorPage />} />
            {/* 403页面 */}
            <Route path="/403" element={<ForbiddenPage />} />
            {/* 搜索结果页 */}
            <Route
                path="/searchResult"
                element={
                  <AuthGuard>
                    <SearchResultPage />
                  </AuthGuard>
                }
            />
            {/* 高级搜索结果页 */}
            <Route
                path="/gaojiSearchResult"
                element={
                  <AuthGuard>
                    <GaojiSearchResultPage />
                  </AuthGuard>
                }
            />
            {/* 内容展示页 */}
            <Route
                path="/contentViewer"
                element={
                  <AuthGuard>
                    <ContentViewerPage />
                  </AuthGuard>
                }
            />
            {/*  上传文件页面  */}
            <Route
                path="/uploadFile"
                element={
                  <AuthGuard>
                    <UploadFilePage />
                  </AuthGuard>
                }
            />
          </Routes>
        </Router>
      </div>

  )
}

export default App
