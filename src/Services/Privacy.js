import React from "react";

const Privacy = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto leading-relaxed text-gray-800">
      <h1 className="text-2xl font-bold mb-4">隐私政策</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">一、信息收集</h2>
      <p>在您使用本平台服务时，我们可能收集以下信息：</p>
      <ul className="list-disc pl-6">
        <li>您注册时填写的用户名、手机号、邮箱等信息；</li>
        <li>您在使用服务过程中产生的操作记录、日志信息等；</li>
        <li>法律法规要求收集的其他必要信息。</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">二、信息使用</h2>
      <p>我们收集您的信息主要用于：</p>
      <ul className="list-disc pl-6">
        <li>提供、改进和优化服务体验；</li>
        <li>向您推送与服务相关的通知或信息；</li>
        <li>符合法律法规及监管要求。</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">三、信息共享</h2>
      <ul className="list-disc pl-6">
        <li>我们不会向任何无关第三方出售或出租您的个人信息。</li>
        <li>仅在以下情况下，我们可能会共享您的信息：
          <ul className="list-disc pl-6">
            <li>获得您的明确同意；</li>
            <li>依法依规或应监管机构要求；</li>
            <li>为提供服务所必需（例如第三方短信/邮件服务商）。</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">四、信息安全</h2>
      <p>我们将采取合理的安全措施，防止您的信息遭到未经授权的访问、披露、篡改或毁坏。但由于互联网环境的复杂性，我们无法保证信息绝对安全。</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">五、您的权利</h2>
      <ul className="list-disc pl-6">
        <li>查询、更正或删除您的个人信息；</li>
        <li>撤回已同意的授权；</li>
        <li>注销您的账户。</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">六、政策更新</h2>
      <p>我们可能会不时更新本隐私政策。更新后的内容将在平台公示并立即生效。</p>
    </div>
  );
};

export default Privacy;
