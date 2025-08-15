import React from "react";
import "./RankingBoard.css";
import { useTranslation } from 'react-i18next';

// 模拟数据
const mockData = [
    { rank: 1, name: "视觉志", freq: 321 },
    { rank: 2, name: "旅游全资讯", freq: 103 },
    { rank: 3, name: "环球旅行", freq: 112 },
    { rank: 4, name: "全球生活视界", freq: 89 },
    { rank: 5, name: "旅行说", freq: 83 },
    { rank: 6, name: "时尚优生活", freq: 81 },
    { rank: 7, name: "美食之旅", freq: 76 },
    { rank: 8, name: "每日风景", freq: 74 },
    { rank: 9, name: "探险家", freq: 70 },
    { rank: 10, name: "畅游天下", freq: 68 }
];

function ThemeRankingBoard({ data = mockData }) {
    const { t } = useTranslation();
    const displayData = data.slice(0, Math.min(data.length, 10));

    return (
        <div className="ranking-container">
            <div className="theme-ranking-board">
                <div className="theme-ranking-title">
                    <span>{t('ThemeRankingTitle')}</span>
                </div>
                <div className="ranking-header">
                    <span>{t('ThemeRanking')}</span>
                    <span>{t('ThemeRankingItems')}</span>
                    <span>{t('ThemeRankingFreq')}</span>
                </div>

                {displayData.map((item, index) => (
                    <div
                        className={`ranking-item ${index < 3 ? `top-${item.rank}` : "normal"}`}
                        key={item.rank}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="rank-cell">
                            {index < 3 ? (
                                <div className={`rank-badge badge-${item.rank}`}>
                                    {item.rank}
                                </div>
                            ) : (
                                <span>{item.rank}</span>
                            )}
                        </div>
                        <div className="name-cell">{item.name}</div>
                        <div className="freq-cell">{item.freq}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RankingBoard({ data = mockData }) {
    const { t } = useTranslation();
    return (
        <div className="ranking-board">
            <div className="ranking-title">
                <h1>{t('RankingTitle')}</h1>
            </div>
            <ThemeRankingBoard />
        </div>
    );
}

export default RankingBoard;
