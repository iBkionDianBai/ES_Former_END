// Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section about">
                    <h3>关于我们</h3>
                    <p>我们致力于打造一个高效、可靠且用户友好的平台。</p>
                </div>
                <div className="footer-section links">
                    <h3>快速链接</h3>
                    <ul>
                        <li><a href="/about">关于</a></li>
                        <li><a href="/services">服务</a></li>
                        <li><a href="/contact">联系</a></li>
                        <li><a href="/faq">FAQ</a></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h3>联系方式</h3>
                    <p>邮箱: support@fakeemail.com</p>
                    <p>电话: +1 000-0000-0000</p>
                </div>
            </div>
            <div className="footer-bottom">
                © {new Date().getFullYear()}. 保留所有权利。
            </div>
        </footer>
    );
};

export default Footer;
