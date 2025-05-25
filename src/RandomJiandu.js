import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 引入axiosConfig文件

function RandomJiandu() {
  const [chutudi, setChutudi] = useState('');
  const [bianhao, setBianhao] = useState('');
  const [timu, setTimu] = useState('');
  const [wenben, setWenben] = useState('');

  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();

  const handleButtonClick = async () => {
    try {
      const jianDu = {
        pageNum: 1,
        pageSize: 20,
        payload: {
          id: 0,
          chutudi: "",
          bianhao: "",
          timu: "",
          wenben: ""
        }
      };
  
      // 发送 API 请求
      axios.defaults.headers['Content-Type'] = 'application/json';
      const response = await axios.post(
        'http://172.18.7.119:8080/JianDuWenBen/select',
        jianDu
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
        const chutudiValue = selectedItem.chutudi;
        const bianhaoValue = selectedItem.bianhao;
        const timuValue = selectedItem.timu;
        const wenbenValue = selectedItem.wenben;
  
        // 更新状态
        setChutudi(chutudiValue);
        setBianhao(bianhaoValue);
        setTimu(timuValue);
        setWenben(wenbenValue);
      } else {
        // 处理数组为空的情况
        setKeshi('');
        setKeshineirong('');
      }
    } catch (error) {
      // 处理错误
      console.error(error);
      if (!token) {
          alert('请先登录');
          navigate("/");
        };
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
      <h3>出土地</h3>
      <p> {chutudi}</p>
      <h3>编号</h3>
      <p>{bianhao}</p>
      <h3>题目</h3>
      <p>{timu}</p>
      <h3>文本</h3>
      <p className='jianduwenben'>{wenben}</p>
    </div>
  </>
  );
}

export default RandomJiandu;