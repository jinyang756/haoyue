/**
 * 量化选股页面模块 - 实现基于AI算法的股票筛选和推荐功能
 */
import { initQuantStrategyChart } from '../chartModule.js';

/**
 * 初始化量化选股页面
 */
export function initQuantStock() {
  console.log('量化选股模块已加载');
  
  // 初始化选股策略图表
  initQuantCharts();
  
  // 初始化筛选条件面板
  initFilterPanel();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化选股按钮事件
  initStockSelection();
}

/**
 * 初始化量化策略图表
 */
function initQuantCharts() {
  // 使用setTimeout确保DOM元素已加载
  setTimeout(() => {
    try {
      // 调用chartModule中的量化策略图表初始化函数
      initQuantStrategyChart();
      
      // 初始化回测图表
      initBacktestChart();
    } catch (error) {
      console.error('初始化量化图表失败:', error);
    }
  }, 100);
}

/**
 * 初始化回测图表
 */
function initBacktestChart() {
  const backtestCanvas = document.getElementById('backtest-chart');
  if (backtestCanvas && typeof Chart !== 'undefined') {
    try {
      // 生成模拟数据
      const dates = generateDates(30);
      const strategyData = generateMockStrategyData(30, 100);
      const indexData = generateMockIndexData(30, 100);
      
      new Chart(backtestCanvas, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: '皓月量化策略',
              data: strategyData,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              fill: false
            },
            {
              label: '沪深300指数',
              data: indexData,
              borderColor: '#6B7280',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return value.toFixed(2) + '%';
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('创建回测图表失败:', error);
    }
  }
}

/**
 * 生成日期数组
 */
function generateDates(days) {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.getMonth() + 1 + '/' + date.getDate());
  }
  
  return dates;
}

/**
 * 生成模拟策略数据
 */
function generateMockStrategyData(count, startValue) {
  let currentValue = startValue;
  const data = [];
  
  for (let i = 0; i < count; i++) {
    // 模拟波动，均值为正值表示策略表现良好
    const change = (Math.random() - 0.45) * 0.8;
    currentValue += change;
    data.push(currentValue.toFixed(2));
  }
  
  return data;
}

/**
 * 生成模拟指数数据
 */
function generateMockIndexData(count, startValue) {
  let currentValue = startValue;
  const data = [];
  
  for (let i = 0; i < count; i++) {
    // 模拟指数波动
    const change = (Math.random() - 0.5) * 0.6;
    currentValue += change;
    data.push(currentValue.toFixed(2));
  }
  
  return data;
}

/**
 * 初始化筛选条件面板
 */
function initFilterPanel() {
  // 初始化筛选条件事件监听
  const filterToggles = document.querySelectorAll('.filter-toggle');
  filterToggles.forEach(toggle => {
    toggle.addEventListener('change', handleFilterChange);
  });
  
  // 初始化参数滑块事件
  const sliders = document.querySelectorAll('.param-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', updateSliderValue);
    // 初始化显示值
    updateSliderValue({ target: slider });
  });
}

/**
 * 处理筛选条件变化
 */
function handleFilterChange(event) {
  const filterName = event.target.name;
  const isChecked = event.target.checked;
  console.log(`筛选条件 ${filterName} 已${isChecked ? '开启' : '关闭'}`);
  
  // 这里可以根据筛选条件的变化更新选股结果
  
  // 显示小动画提示用户筛选条件已更新
  showFilterUpdateHint();
}

/**
 * 更新滑块值显示
 */
function updateSliderValue(event) {
  const slider = event.target;
  const valueDisplay = document.getElementById(`${slider.id}-value`);
  if (valueDisplay) {
    valueDisplay.textContent = slider.value;
  }
}

/**
 * 显示筛选更新提示
 */
function showFilterUpdateHint() {
  const hint = document.getElementById('filter-update-hint');
  if (hint) {
    hint.classList.remove('hidden');
    hint.classList.add('opacity-100');
    
    setTimeout(() => {
      hint.classList.add('opacity-0');
      setTimeout(() => {
        hint.classList.add('hidden');
      }, 300);
    }, 2000);
  }
}

/**
 * 初始化选股按钮事件
 */
function initStockSelection() {
  const selectButton = document.getElementById('run-selection-btn');
  if (selectButton) {
    selectButton.addEventListener('click', runStockSelection);
  }
}

/**
 * 执行选股操作
 */
function runStockSelection() {
  // 显示加载状态
  const resultContainer = document.getElementById('selection-results');
  const loadingIndicator = document.getElementById('selection-loading');
  
  if (resultContainer && loadingIndicator) {
    resultContainer.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    
    // 模拟选股过程
    setTimeout(() => {
      generateStockSelectionResults();
      loadingIndicator.classList.add('hidden');
      resultContainer.classList.remove('hidden');
    }, 2000);
  }
}

/**
 * 生成选股结果
 */
function generateStockSelectionResults() {
  // 模拟AI选股结果
  const mockResults = [
    { code: '600519', name: '贵州茅台', score: '98', industry: '白酒', signal: '买入', confidence: '极高' },
    { code: '000858', name: '五粮液', score: '95', industry: '白酒', signal: '买入', confidence: '高' },
    { code: '600276', name: '恒瑞医药', score: '92', industry: '医药生物', signal: '买入', confidence: '高' },
    { code: '000333', name: '美的集团', score: '90', industry: '家用电器', signal: '增持', confidence: '高' },
    { code: '601888', name: '中国中免', score: '88', industry: '旅游零售', signal: '增持', confidence: '中高' },
  ];
  
  const resultsTable = document.getElementById('selection-results-table').querySelector('tbody');
  if (resultsTable) {
    // 清空现有结果
    resultsTable.innerHTML = '';
    
    // 生成结果行
    mockResults.forEach((stock, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 transition-colors duration-200';
      
      let signalClass = '';
      switch(stock.signal) {
        case '买入':
          signalClass = 'bg-red-100 text-red-800';
          break;
        case '增持':
          signalClass = 'bg-orange-100 text-orange-800';
          break;
        default:
          signalClass = 'bg-gray-100 text-gray-800';
      }
      
      row.innerHTML = `
        <td class="py-3 px-4 border-b">${index + 1}</td>
        <td class="py-3 px-4 border-b">
          <div class="font-medium">${stock.name}</div>
          <div class="text-sm text-gray-500">${stock.code}</div>
        </td>
        <td class="py-3 px-4 border-b">${stock.industry}</td>
        <td class="py-3 px-4 border-b font-bold text-blue-600">${stock.score}</td>
        <td class="py-3 px-4 border-b">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${signalClass}">
            ${stock.signal}
          </span>
        </td>
        <td class="py-3 px-4 border-b">${stock.confidence}</td>
      `;
      
      resultsTable.appendChild(row);
      
      // 添加渐入动画
      setTimeout(() => {
        row.classList.add('opacity-100', 'translate-y-0');
        row.classList.remove('opacity-0', 'translate-y-4');
      }, 100 * index);
    });
  }
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#quant-stock-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
}