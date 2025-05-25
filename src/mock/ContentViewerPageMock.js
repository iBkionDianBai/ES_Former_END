import Mock from 'mockjs';

Mock.setup({ timeout: '800-1200' }); // 设置响应延迟

// 模拟文章数据
const mockArticle = Mock.mock({
    title: '气候变化对全球生态系统的影响',
    content: `
    <p>气候变化是当今全球面临的最严峻挑战之一...</p>
    
    <h2 id="section1">1. 气候变化的现状与趋势</h2>
    <p>全球气温持续上升，过去100年中...</p>
    
    <h3 id="section1-1">1.1 全球气温变化趋势</h3>
    <p>根据IPCC最新报告，全球气温正在以每十年约0.2°C的速度上升...</p>
    
    <figure id="figure1">
      <img src="https://picsum.photos/800/400?random=1" alt="全球气温变化趋势图" />
      <figcaption>图1: 全球平均气温变化趋势(1880-2023)</figcaption>
    </figure>
    
    <h3 id="section1-2">1.2 极端天气事件频率增加</h3>
    <p>气候变化不仅导致平均气温上升，还引发了更多的极端天气事件...</p>
    
    <h2 id="section2">2. 气候变化对生态系统的影响</h2>
    <p>气候变化正在改变全球生态系统的结构和功能...</p>
    
    <h3 id="section2-1">2.1 生物多样性丧失</h3>
    <p>许多物种无法适应快速的气候变化，导致种群数量下降甚至灭绝...</p>
    
    <figure id="figure2">
      <img src="https://picsum.photos/800/400?random=2" alt="生物多样性丧失示意图" />
      <figcaption>图2: 气候变化对生物多样性的影响</figcaption>
    </figure>
    
    <h3 id="section2-2">2.2 物种分布变化</h3>
    <p>随着气温升高，许多物种正在向两极或高海拔地区迁移...</p>
    
    <h3 id="section2-3">2.3 生态系统服务受损</h3>
    <p>生态系统为人类提供了许多重要服务，如清洁水源、土壤保持...</p>
    
    <table id="table1">
      <thead>
        <tr>
          <th>生态系统服务</th>
          <th>受影响程度</th>
          <th>主要影响因素</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>食物生产</td>
          <td>高</td>
          <td>极端天气、病虫害增加</td>
        </tr>
        <tr>
          <td>水资源调节</td>
          <td>中高</td>
          <td>降水模式变化、冰川融化</td>
        </tr>
        <tr>
          <td>碳储存</td>
          <td>中</td>
          <td>森林砍伐、火灾增加</td>
        </tr>
      </tbody>
    </table>
    <p class="table-caption">表1: 气候变化对主要生态系统服务的影响评估</p>
    
    <h2 id="section3">3. 应对气候变化的策略</h2>
    <p>面对气候变化的挑战，需要采取综合策略...</p>
    
    <h3 id="section3-1">3.1 减缓气候变化</h3>
    <p>减缓气候变化需要全球合作减少温室气体排放...</p>
    
    <h3 id="section3-2">3.2 增强生态系统适应性</h3>
    <p>增强生态系统的适应性可以帮助它们更好地应对气候变化的影响...</p>
    
    <h3 id="section3-3">3.3 政策与国际合作</h3>
    <p>有效的政策和国际合作对于应对气候变化至关重要...</p>
    
    <h2 id="section4">4. 结论与展望</h2>
    <p>气候变化对全球生态系统的影响是深远的...</p>
    
    <figure id="figure3">
      <img src="https://picsum.photos/800/400?random=3" alt="可持续未来展望" />
      <figcaption>图3: 可持续发展路径示意图</figcaption>
    </figure>
    
    <h3 id="section4-1">4.1 未来研究方向</h3>
    <p>未来的研究应集中在提高气候变化预测的准确性...</p>
    
    <blockquote>
      "我们不是继承了地球，而是从子孙后代那里借用了它。" - 联合国环境规划署
    </blockquote>
  `
});

// 模拟文章API
Mock.mock('/api/article', 'get', () => {
    return {
        code: 200,
        message: 'success',
        data: mockArticle
    };
});

// 导出初始化函数（如果需要在应用入口处手动初始化）
export const initArticleMock = () => {
    console.log('[Mock] 文章数据模拟已启动');
};