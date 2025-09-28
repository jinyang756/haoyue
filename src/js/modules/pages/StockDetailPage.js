// StockDetailPage.js - 股票详情页面组件
const StockDetailPage = {
  render(data = {}) {
    const stockCode = data.stockCode || '600519';
    const stockName = data.stockName || '贵州茅台';
    
    return `
      <!-- 股票详情页面 -->
      <section class="mb-8">
        <!-- 股票基本信息 -->
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 class="text-2xl font-bold text-white">${stockName}</h2>
              <p class="text-gray-400">${stockCode}</p>
            </div>
            <div class="mt-4 md:mt-0 flex gap-3">
              <button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                <i class="fa fa-star-o mr-1"></i> 收藏
              </button>
              <button class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
                <i class="fa fa-share-alt mr-1"></i> 分享
              </button>
            </div>
          </div>
          
          <!-- 股票价格信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-400 mb-1">最新价</p>
              <p class="text-2xl font-bold text-white">1,782.00</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-400 mb-1">涨跌幅</p>
              <p class="text-2xl font-bold text-red-500">-1.23%</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-400 mb-1">成交量</p>
              <p class="text-2xl font-bold text-white">12.56万手</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-400 mb-1">成交额</p>
              <p class="text-2xl font-bold text-white">22.35亿</p>
            </div>
          </div>
        </div>
        
        <!-- 价格走势图表 -->
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">价格走势</h3>
            <div class="flex gap-2">
              <button class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors">日K</button>
              <button class="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">周K</button>
              <button class="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">月K</button>
              <button class="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">分时</button>
            </div>
          </div>
          <div class="h-80">
            <canvas id="stockChart"></canvas>
          </div>
        </div>
        
        <!-- 公司基本信息 -->
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 class="text-lg font-semibold text-white mb-4">公司基本信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <table class="w-full">
                <tbody>
                  <tr class="border-b border-gray-800">
                    <td class="py-2 px-4 text-gray-400">所属行业</td>
                    <td class="py-2 px-4 text-white">酿酒行业</td>
                  </tr>
                  <tr class="border-b border-gray-800">
                    <td class="py-2 px-4 text-gray-400">地区</td>
                    <td class="py-2 px-4 text-white">贵州</td>
                  </tr>
                  <tr class="border-b border-gray-800">
                    <td class="py-2 px-4 text-gray-400">市盈率(TTM)</td>
                    <td class="py-2 px-4 text-white">32.56</td>
                  </tr>
                  <tr class="border-b border-gray-800">
                    <td class="py-2 px-4 text-gray-400">市净率</td>
                    <td class="py-2 px-4 text-white">11.32</td>
                  </tr>
                  <tr class="border-b border-gray-800">
                    <td class="py-2 px-4 text-gray-400">总市值</td>
                    <td class="py-2 px-4 text-white">22,435亿</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 class="font-medium text-white mb-2">公司简介</h4>
              <p class="text-gray-300 text-sm">
                贵州茅台酒股份有限公司主要从事茅台酒及系列白酒的生产和销售。公司茅台酒是世界三大蒸馏名酒之一，也是集国家地理标志产品、有机食品和国家非物质文化遗产于一身的白酒品牌。
              </p>
              <button class="mt-3 text-blue-400 hover:text-blue-300 text-sm">
                查看更多 <i class="fa fa-angle-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  },
  init(data = {}) {
    // 初始化股票详情页面功能
    this.initStockChart();
    this.setupEventListeners();
    if (data.stockCode) {
      this.loadStockData(data.stockCode);
    }
  },
  loadStockData(stockCode) {
    // 模拟加载股票数据
    console.log(`加载股票代码 ${stockCode} 的数据`);
    // 实际应用中这里应该调用API获取数据
  },
  initStockChart() {
    // 初始化股票走势图表
    if (window.initChartJs) {
      window.initChartJs().then(Chart => {
        const ctx = document.getElementById('stockChart');
        if (!ctx) return;
        
        // 模拟数据
        const dates = ['09:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00', '14:30', '15:00'];
        const prices = [1795, 1802, 1800, 1792, 1785, 1788, 1790, 1785, 1782];
        
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: '价格',
              data: prices,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              y: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      });
    }
  },
  setupEventListeners() {
    // 设置收藏按钮的点击事件
    const favoriteBtn = document.querySelector('button:has(.fa-star-o)');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        favoriteBtn.innerHTML = '<i class="fa fa-star mr-1"></i> 已收藏';
        favoriteBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
        favoriteBtn.classList.add('bg-gray-700', 'hover:bg-gray-600');
        alert('已添加到收藏！');
      });
    }
    
    // 设置K线图切换按钮的点击事件
    document.querySelectorAll('.bg-gray-800.px-3.py-1.rounded').forEach(btn => {
      btn.addEventListener('click', () => {
        // 移除所有按钮的选中状态
        document.querySelectorAll('.bg-purple-600.px-3.py-1.rounded, .bg-gray-800.px-3.py-1.rounded').forEach(b => {
          b.classList.remove('bg-purple-600', 'hover:bg-purple-700');
          b.classList.add('bg-gray-800', 'hover:bg-gray-700');
        });
        
        // 设置当前按钮为选中状态
        btn.classList.remove('bg-gray-800', 'hover:bg-gray-700');
        btn.classList.add('bg-purple-600', 'hover:bg-purple-700');
        
        // 重新加载图表数据
        this.initStockChart();
      });
    });
  }
};

export default StockDetailPage;