// ImageSlider.js
import React from "react";
import Slider from "react-slick";
import { Link } from 'react-router-dom';

// 在头部引入 css
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import RandomKeshi from "./RandomKeshi";

function ImageSlider() {
  const settings = {
    className: "",
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  return (
    <div className="bottom-section">
      <div className="unit unit-box1">
        <Link to="/link5" style={{ color: '#0958d9', fontSize: 25, fontWeight: 'bold' }}>
          秦考古文献
        </Link>
        <Slider {...settings}>
          <div>
            <h3>作者</h3>
            <p>袁仲一</p>
            <h3>文献名称</h3>
            <p>《园寺吏舍”考论》</p>
            <h3>文献来源</h3>
            <p>《安徽文学》</p>
          </div>
          <div>
            <h3>作者</h3>
            <p>曹旅宁</p>
            <h3>文献名称</h3>
            <p>《“秦”考》</p>
            <h3>文献来源</h3>
            <p>《宝鸡师院学报》</p>
          </div>
        </Slider>
      </div>

      <div className="unit unit-box2">
        <ul className="box-link">
          <Link to="/link1" style={{ color: '#0958d9', fontSize: 25, fontWeight: 'bold' }}>
            刻石文本
          </Link>
        </ul>
        <Slider {...settings}>
          <RandomKeshi/>
        </Slider>
        <ul class="box-link">
      <Link to="/link3" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        简牍文本
      </Link></ul>
      <Slider {...settings}>
      <div>
            <h3>出土地</h3>
            <p>云梦睡虎地秦简</p>
            <h3>题目</h3>
            <p>日书乙种</p>
          </div>
          <div>
            <h3>出土地</h3>
            <p>云梦睡虎地秦简</p>
            <h3>题目</h3>
            <p>日书乙种</p>
          </div>
      </Slider>
      <ul class="box-link">
      <Link to="/link4" style={{ color: '#0958d9',fontSize: 25 , fontWeight: 'bold'}}>
        秦始皇本纪文
      </Link></ul>
        <Slider {...settings}>
          <div>
          <h3>纪年</h3>
          <p>秦记 </p>
          </div>
          <div>
            <h3>文本</h3>
            <p>1111111111</p>
          </div>
        </Slider>
      </div>

      <div class="unit unit-box3">
    <ul class="box-link">
      <Link to="/link2" style={{ color: '#0958d9',fontSize: 25, fontWeight: 'bold' }}>
        墓葬信息
      </Link></ul>
        <Slider {...settings}>
          <div>
            <h3>刻石名称</h3>
            <p>峄山刻石</p>
          </div>
          <div>
            <h3>文本</h3>
            <p>1111111111</p>
          </div>
        </Slider>
      </div>
    </div>
  );
}

export default ImageSlider;
