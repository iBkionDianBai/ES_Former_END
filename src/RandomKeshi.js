import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

function RandomKeshi() {
  const [keshi, setKeshi] = useState('');
  const [keshineirong, setKeshineirong] = useState('');

  const handleButtonClick = async () => {
    try {
      const keShiWenBen = {
        pageNum: 1,
        pageSize: 20,
        payload: {
          id: 0,
          keshi: "",
          keshineirong: ""
        }
      };
  
      // 发送 API 请求
      axios.defaults.headers['Content-Type'] = 'application/json';
      const response = await axios.post(
        'http://172.18.7.119:8080/KeShiWenBen/select',
        keShiWenBen
      );
  // 打印返回值
  console.log(response,'response');
  console.log(response.data,'response---data');
      // 从返回的数据中随机选择一个对象
      // debugger
      const data = response.data.data.rows || [];
      if (data.length > 0) {
        
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedItem = data[randomIndex];
  
        // 从选择的对象中获取 keshi 和 keshineirong 的值
        const keshiValue = selectedItem.keshi;
        const keshineirongValue = selectedItem.keshineirong;
  
        // 更新状态
        setKeshi(keshiValue);
        setKeshineirong(keshineirongValue);
      } else {
        // 处理数组为空的情况
        setKeshi('');
        setKeshineirong('');
      }
    } catch (error) {
      // 处理错误
      console.error(error);
      // alert('请求失败，请稍后重试');
    }
  };
  useEffect(() => {
    handleButtonClick(); // 在组件加载完成后自动触发点击事件
  }, []); // 空数组作为第二个参数，表示只在组件加载完成后触发一次

  return (
    <>

    <div style={{ paddingLeft: '10px' }}>
      <button onClick={handleButtonClick} style={{ width: '100%' }}> 换一批刻石</button>

      {/* 显示 keshi 和 keshineirong 的值 */}
      <h3>刻石名称</h3>
      <p> {keshi}</p>
      <h3>刻石文本</h3>
      <p className='keshiwenben'>{keshineirong}</p>
    </div>
    </>
  );
}

export default RandomKeshi;