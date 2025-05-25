import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

function RandomMuzang() {
  const [mdmc, setMdmc] = useState('');
  const [mdbh, setMdbh] = useState('');
  const [mdFl, setMdFl] = useState('');
  const [mdFx, setMdFx] = useState('');
  const [mdSd, setMdSd] = useState('');
  const [mdFq, setMdfq] = useState('');
  const [mzxz, setMzxz] = useState('');
  const [msxzMsc, setMsxzMsc] = useState('');
  const [msxzMsk, setMsxzMsk] = useState('');
  const [msxzMss, setMsxzMss] = useState('');
  const [mzrZz, setMzrZz] = useState('');
  const [mzrTx, setMzrTx] = useState('');


  const handleButtonClick = async () => {
    try {
      const muZang = {
        pageNum: 1,
        pageSize: 50,
        payload: {
            mdmc: "",
            mdbh: "",
            mdFl: "",
            mdFx: "",
            mdSd: "",
            mdFq: "",
            mzxz: "",
            msxzMsc: "",
            msxzMsk: "",
            msxzMss: "",
            mzrZz:"",
            mzrTx:"",
        }
      };
  
      // 发送 API 请求
      axios.defaults.headers['Content-Type'] = 'application/json';
      const response = await axios.post(
        'http://172.18.7.119:8080/MdInfo/queryMdInfoPage',
        muZang
      );
  // 打印返回值
  console.log(response,'response');
  console.log(response.data.data.payload,'response---data');
      // 从返回的数据中随机选择一个对象
      // debugger
      const data = response.data.data.payload || [];
      if (data.length > 0) {
        
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedItem = data[randomIndex];
  
        // 从选择的对象中获取 keshi 和 keshineirong 的值
        const  mdmcValue = selectedItem. mdmc;
        const mdbhValue = selectedItem.mdbh;
        const mdFlValue = selectedItem.mdFl;
        const mdFxValue = selectedItem.mdFx;
        const mdSdValue = selectedItem.mdSd;
        const mdFqValue = selectedItem.mdFq;
        const mzxzValue = selectedItem.mzxz;
        const msxzMscValue = selectedItem.msxzMsc;
        const msxzMskValue = selectedItem.msxzMsk;
        const msxzMssValue = selectedItem.msxzMss;
        const mzrZzValue = selectedItem.mzrZz;
        const mzrTxValue = selectedItem.mzrTx;
  
        // 更新状态
        setMdmc(mdmcValue);
        setMdbh(mdbhValue);
        setMdFl(mdFlValue);
        setMdFx(mdFxValue);
        setMdSd(mdSdValue);
        setMdfq(mdFqValue);
        setMzxz(mzxzValue);
        setMsxzMsc(msxzMscValue);
        setMsxzMsk(msxzMskValue);
        setMsxzMss(msxzMssValue);
        setMzrZz(mzrZzValue);
        setMzrTx(mzrTxValue);

      } else {
        // 处理数组为空的情况
        setMdmc('');
        setMdbh('');
        setMdFl('');
        setMdFx('');
        setMdSd('');
        setMdfq('');
        setMzxz('');
        setMsxzMsc('');
        setMsxzMsk('');
        setMsxzMss('');
        setMzrZz('');
        setMzrTx('');
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
      <button onClick={handleButtonClick} style={{ width: '100%' }}> 换一批墓葬信息</button>

      <h3>墓地名称</h3>
      <p> {mdmc}</p>
      <h3>墓地编号</h3>
      <p>{mdbh}</p>
      <h3>墓地分类</h3>
      <p>{mdFl}</p>
      <h3>墓地方向</h3>
      <p>{mdFx}</p>
      <h3>墓地时代</h3>
      <p>{mdSd}</p>
      <h3>墓地分期</h3>
      <p>{mdFq}</p>
      <h3>墓葬形制</h3>
      <p>{mzxz}</p>
      <h3>墓葬形制墓室长</h3>
      <p>{msxzMsc}</p>
      <h3>墓葬形制墓室宽</h3>
      <p>{msxzMsk}</p>
      <h3>墓葬形制墓室深</h3>
      <p>{msxzMss}</p>
      <h3>墓主人葬式</h3>
      <p>{mzrZz}</p>
      <h3>墓主人头向</h3>
      <p>{mzrTx}</p>
    </div>
    </>
  );
}

export default RandomMuzang;