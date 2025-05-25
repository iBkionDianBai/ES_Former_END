import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

function RandomQingbenji() {
  const [jinian, setJinian] = useState('');
  const [wenben, setWenben] = useState('');

  const handleButtonClick = async () => {
    try {
      const qingBenJi = {
        pageNum: 1,
        pageSize: 20,
        payload: {
          id: 0,
          jinian: "",
          wenben: ""
        }
      };
  
      // 发送 API 请求
      axios.defaults.headers['Content-Type'] = 'application/json';
      const response = await axios.post(
        'http://172.18.7.119:8080/QshBenJiWenXian/select',
        qingBenJi
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
        const jinianValue = selectedItem.jinian;
        const wenbenValue = selectedItem.wenben;
  
        // 更新状态
        setJinian(jinianValue);
        setWenben(wenbenValue);
      } else {
        // 处理数组为空的情况
        setJinian('');
        setWenben('');
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
      <button onClick={handleButtonClick} style={{ width: '100%' }}> 换一批秦本纪文本</button>

      {/* 显示 keshi 和 keshineirong 的值 */}
      <h3>纪年</h3>
      <p> {jinian}</p>
      <h3>文本</h3>
      <p className='qinbenjiwenben'>{wenben}</p>
    </div>
    </>
  );
}

export default RandomQingbenji;