import React from "react";

const Terms = () => {
    return (
        <div className="p-6 max-w-3xl mx-auto leading-relaxed text-gray-800">
            <h1 className="text-2xl font-bold mb-4">用户协议</h1>

            <h2 className="text-xl font-semibold mt-6 mb-2">一、总则</h2>
            <p>本协议是用户（以下简称“您”）与本平台之间关于使用本平台产品与服务所订立的协议。在使用本平台之前，请您仔细阅读并充分理解本协议。若您使用本平台，即视为您已同意本协议的全部内容。</p>

            <h2 className="text-xl font-semibold mt-6 mb-2">二、用户注册与使用</h2>
            <ul className="list-disc pl-6">
                <li>您应当使用真实、准确、合法的资料进行注册，不得冒用他人信息。</li>
                <li>注册成功后，账户由您自行保管，因账户保管不善造成的损失由您自行承担。</li>
                <li>您不得利用本平台从事违法违规活动，包括但不限于发布违法内容、侵害他人合法权益等。</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">三、服务使用</h2>
            <ul className="list-disc pl-6">
                <li>本平台有权根据业务需要，对部分服务进行调整、暂停或终止，并在合理范围内提前告知。</li>
                <li>本平台在合理范围内尽力保障服务的稳定性，但不对因不可抗力或非本平台原因造成的服务中断或数据丢失负责。</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">四、知识产权</h2>
            <p>本平台提供的内容（包括但不限于文字、图片、音频、视频、软件等）受法律保护。未经许可，您不得擅自复制、传播、修改或用于商业用途。</p>

            <h2 className="text-xl font-semibold mt-6 mb-2">五、责任限制</h2>
            <ul className="list-disc pl-6">
                <li>对于因您自身原因、不可抗力或第三方原因导致的损失，本平台不承担责任。</li>
                <li>在适用法律允许的范围内，本平台对因使用服务产生的间接损失不承担责任。</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">六、协议的修改</h2>
            <p>本平台有权根据业务发展需要随时修改本协议，并提前在平台上公示。修改后的协议在公布时生效，若您继续使用本平台，即视为接受修改内容。</p>

            <h2 className="text-xl font-semibold mt-6 mb-2">七、法律适用与争议解决</h2>
            <p>本协议适用中华人民共和国法律。因本协议产生的争议，双方应友好协商解决；协商不成时，任一方可向本平台所在地有管辖权的人民法院提起诉讼。</p>
        </div>
    );
};

export default Terms;
