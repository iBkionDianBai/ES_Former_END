import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import './MainPage.css' // Import the CSS file

function MainPage() {
const location = useLocation()
const username = location.state?.username

return (
<div>
{/* Top Section */}
<div className="top-section">
<ul class="top-section-left"><h1 >秦文明数据库</h1></ul>
<ul class="top-section-right">
<li> 欢迎: {username}</li>
<li><Link to="/">退出登录</Link></li>
</ul>
</div>

  {/* Bottom Section */}
  <div className="bottom-section">
    <div class="unit unit-box1">
      <ul class="box-link">
      <Link to="/link5" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        秦考古文献
      </Link></ul>
      <h3>作者</h3>
      <p>袁仲一、曹旅宁、张仲立、徐卫民、党士学、刘占成、王辉、林剑鸣、李学勤、蒋文孝、王学理、王子今、张天恩、张占民</p>
      <h3>文献名称</h3>
      <p>《园寺吏舍”考论》 《“秦”考》 《“绿脸应为军中人” 质疑》 《“~”形青铜板饰的几点认识》 《“敖童”解》 《“相启”即昌平君说商》 《“痕迹考证与秦陵兵马俑”辨析》 《“假门逆旅”新探》 《“吏谁从军”解一一读秦简(编年记)札记》 《“丽山”与“丽邑”》</p>
      <h3>文献来源</h3> 
      <p>《安徽文学》 《宝鸡师院学报》 《北方文物》 《北京师范大学学报(社会科学版)》 《北京师范大学学报(自然科学版)》 《成物》 《出土文献研究》第五集 《船山学刊》 《大学图书情报学刊》</p>
    </div>
    <div class="unit unit-box2">
    <ul class="box-link">
      <Link to="/link1" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        刻石文本
      </Link></ul>
      <h3>刻石名称</h3>
      <p >峄山刻石 泰山刻石 琅邪台刻石 之罘刻石 东观刻石 碣石刻石 会稽刻石</p>
      <ul class="box-link">
      <Link to="/link3" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        简牍文本
      </Link></ul>
      <h3>出土地</h3>
      <p>云梦睡虎地秦简</p>
      <h3>题目</h3>
      <p>日书甲种 日书乙种 法律问 封诊式 金布律 司空 既苑律 仓律 效律(空) 秦律雅抄 内史杂 效律工律 工人程 </p>
      <ul class="box-link">
      <Link to="/link4" style={{ color: '#0958d9',fontSize: 25 , fontWeight: 'bold'}}>
        秦始皇本纪文
      </Link></ul>
      <h3>纪年</h3>
      <p>秦记 秦始皇三十七年 秦始皇三十五年 秦始皇二十八年 二世三年 二世元年 秦始皇二十六年 秦始皇本纪——赞 秦始皇十年</p>
    
    </div>
    <div class="unit unit-box3">
    <ul class="box-link">
      <Link to="/link2" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        墓葬信息
      </Link></ul>
      <h3>墓地名称</h3>
      <p>高陵墓地 咸阳塔儿坡 淅川马川 任家咀 95世泰思 03中石长油 05张家堡 10中登花园</p>
      <h3>墓地分类</h3>
      <p>洞室 竖穴 </p>
      <h3>墓地时代</h3>
      <p>春秋战国 春秋中期 春秋晚期 战国早期 战国中期 战国中期偏晚 战国晚期 战国晚期到秦末 秦</p>
      <h3>墓葬形式</h3>
      <p>竖穴土圹 竖穴墓道偏洞室 竖穴墓道直线洞室 竖穴墓道并行洞室墓 竖穴墓道直线洞室墓 长方形砖室墓 	甲字形砖室墓 </p>
      <p>墓地名称 墓地编号 墓地分类 墓地方向 墓地时代 莫葬形制 墓主人葬式 墓主人头向</p>
    </div>
  </div>
</div>
)
}