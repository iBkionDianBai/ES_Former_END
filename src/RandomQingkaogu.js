import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

function RandomQingkaogu() {
  const [zz, setZz] = useState('');
  const [wxmc, setWxmc] = useState('');
  const [wxly, setWxly] = useState('');
  const [cbjg, setCbjg] = useState('');
  const [fbsj, setFbsj] = useState('');
  const [wzzy, setWzzy] = useState('');
  const [guanjianzi, setGuanjianzi] = useState('');

  const handleButtonClick = async () => {
    try {
      const qingKaoGU = {
        pageNum: 1,
        pageSize: 20,
        payload: {
          id: 0,
          zz: "",
          wxmc: "",
          wxly: "",
          cbjg: "",
          fbsj: "",
          wxzy: "",
          guanjianzi: ""
        }
      };
  
      // 发送 API 请求，添加令牌到请求头
      axios.defaults.headers['Content-Type'] = 'application/json';
      const token = sessionStorage.getItem('token');
      console.log('能否返回token',token);
      if (token) {
        axios.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.post(
        'http://172.18.7.119:8080/QinKaoGuWenXian/select',
        qingKaoGU
      );
  
      // 从返回的数据中随机选择一个对象
      const data = response.data.data.rows || [];
      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedItem = data[randomIndex];
  
        // 从选择的对象中获取相应字段的值
        const zzValue = selectedItem.zz;
        const wxmcValue = selectedItem.wxmc;
        const wxlyValue = selectedItem.wxly;
        const cbjgValue = selectedItem.cbjg;
        const fbsjValue = selectedItem.fbsj;
        const wxzyValue = selectedItem.wxzy;
        const guanjianziValue = selectedItem.guanjianzi;
  
        // 更新状态
        setZz(zzValue);
        setWxmc(wxmcValue);
        setWxly(wxlyValue);
        setCbjg(cbjgValue);
        setFbsj(fbsjValue);
        setWzzy(wxzyValue);
        setGuanjianzi(guanjianziValue);
      } else {
        // 处理数组为空的情况
        setZz('');
        setWxmc('');
        setWxly('');
        setCbjg('');
        setFbsj('');
        setWzzy('');
        setGuanjianzi('');
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
      <button onClick={handleButtonClick} style={{ width: '100%' }}> 换一批秦考古文献</button>

      {/* 显示相应字段的值 */}
      <h3>作者</h3>
      <p>{zz}</p>
      <h3>文献名称</h3>
      <p>{wxmc}</p>
      <h3>文献来源</h3>
      <p>{wxly}</p>
      <h3>出版机构</h3>
      <p>{cbjg}</p>
      <h3>发表时间</h3>
      <p>{fbsj}</p>
      <h3>关键字</h3>
      <p>{guanjianzi}</p>
      <h3>文献摘要</h3>
      <p className='wenxianzhaiyao'>{wzzy}</p>
      
    </div>
    </>
  );
}

export default RandomQingkaogu;