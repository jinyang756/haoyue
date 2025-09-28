/**
 * 首页模块 - 实现市场概览、热门板块等功能
 */
import { initMarketIndexCharts } from '../chartModule.js';
import { navigateTo } from '../navigation.js';
import { createFeatureFlag } from '../../flags.js';

/**
 * 初始化首页功能
 */
export async function initHomePage() {
  console.log('首页模块已加载');
  
  // 使用功能标志
  const myFeatureFlag = await createFeatureFlag("my_feature_flag")();
  console.log('my_feature_flag状态:', myFeatureFlag);
  
  // 动态加载HTML模板
  await loadHomePageTemplate();
  
  // 显示功能标志状态
  showFeatureFlagStatus(myFeatureFlag);
  
  // 初始化市场指数图表
  initMarketCharts();
  
  // 初始化当前日期和时间更新
  initDateTime();
  
  // 添加页面加载动画效果
  initPageAnimation();
  
  // 绑定事件
  bindEvents();
}

/**
 * 显示功能标志状态
 */
function showFeatureFlagStatus(enabled) {
  try {
    // 创建一个显示功能标志状态的元素
    const statusElement = document.createElement('div');
    statusElement.className = 'fixed top-4 right-4 bg-gray-900 border border-gray-800 rounded-lg p-3 shadow-lg z-50';
    statusElement.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-white">my_feature_flag</span>
        <span class="px-2 py-1 text-xs rounded ${enabled ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}">
          ${enabled ? '开启' : '关闭'}
        </span>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(statusElement);
  } catch (error) {
    console.error('显示功能标志状态失败:', error);
  }
}

/**
 * 动态加载首页HTML模板
 */
async function loadHomePageTemplate() {
  try {
    // 获取模板内容
    const response = await fetch('src/js/modules/pages/templates/homePageTemplate.html');
    const templateHtml = await response.text();
    
    // 清空并填充首页内容
    const homePageElement = document.getElementById('home-page');
    if (homePageElement) {
      homePageElement.innerHTML = templateHtml;
    }
  } catch (error) {
    console.error('加载首页模板失败:', error);
  }
}

/**
 * 绑定页面事件
 */
function bindEvents() {
  // 绑定查看全部股票事件
  const viewAllStocksBtn = document.getElementById('view-all-stocks');
  if (viewAllStocksBtn) {
    viewAllStocksBtn.addEventListener('click', () => {
      navigateTo('market-list');
    });
  }
  
  // 绑定查看全部策略事件
  const viewAllStrategiesBtn = document.getElementById('view-all-strategies');
  if (viewAllStrategiesBtn) {
    viewAllStrategiesBtn.addEventListener('click', () => {
      navigateTo('quant-stock');
    });
  }
  
  // 绑定股票详情按钮事件
  const detailButtons = document.querySelectorAll('.view-stock-detail');
  detailButtons.forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const stockCode = row.querySelector('td:first-child').textContent;
      navigateTo('stock-detail', { stockCode });
    });
  });
}

/**
 * 初始化市场指数图表
 */
function initMarketCharts() {
  // 使用setTimeout确保DOM元素已加载
  setTimeout(() => {
    try {
      // 调用chartModule中的市场指数图表初始化函数
      initMarketIndexCharts();
      
      // 初始化其他小图表
      initSmallCharts();
    } catch (error) {
      console.error('初始化市场图表失败:', error);
    }
  }, 100);
}

/**
 * 初始化小图表（上证指数、深证成指、创业板指）
 */
function initSmallCharts() {
  try {
    // 上证指数小图表
    const shCtx = document.getElementById('sh-index-chart');
    if (shCtx) {
      initSmallChart(shCtx, '#EF4444', [3720, 3735, 3728, 3745, 3760, 3752, 3740, 3755, 3770, 3785, 3775, 3765, 3775, 3790, 3805, 3795, 3785, 3795, 3810, 3825, 3815, 3805, 3815, 3830, 3845, 3835, 3825, 3835, 3850, 3826]);
    }
    
    // 深证成指小图表
    const szCtx = document.getElementById('sz-index-chart');
    if (szCtx) {
      initSmallChart(szCtx, '#EF4444', [12300, 12350, 12320, 12380, 12420, 12400, 12370, 12410, 12450, 12490, 12460, 12430, 12470, 12510, 12550, 12520, 12490, 12530, 12570, 12610, 12580, 12550, 12590, 12630, 12670, 12640, 12610, 12650, 12690, 12584]);
    }
    
    // 创业板指小图表（如果存在）
    const gemCtx = document.getElementById('gem-index-chart');
    if (gemCtx) {
      initSmallChart(gemCtx, '#EF4444', [2480, 2495, 2488, 2505, 2520, 2512, 2500, 2515, 2530, 2545, 2535, 2525, 2535, 2550, 2565, 2555, 2545, 2555, 2570, 2585, 2575, 2565, 2575, 2590, 2605, 2595, 2585, 2595, 2610, 2543]);
    }
  } catch (error) {
    console.error('初始化小图表失败:', error);
  }
}

/**
 * 初始化小图表的通用函数
 */
function initSmallChart(canvas, color, data) {
  if (typeof Chart !== 'undefined') {
    try {
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: Array(30).fill(''),
          datasets: [{
            data: data,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    } catch (error) {
      console.error('创建图表失败:', error);
    }
  }
}

/**
 * 初始化当前日期和时间更新
 */
function initDateTime() {
  // 更新日期和时间
  function updateDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    const currentDateEl = document.getElementById('current-date');
    const currentTimeEl = document.getElementById('current-time');
    
    if (currentDateEl) {
      currentDateEl.textContent = now.toLocaleDateString('zh-CN', dateOptions);
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = now.toLocaleTimeString('zh-CN', timeOptions);
    }
  }
  
  // 立即更新一次
  updateDateTime();
  
  // 每分钟更新一次
  setInterval(updateDateTime, 60000);
}

/**
 * 初始化页面动画效果
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#home-page .card-hover');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      // 触发重排
      void element.offsetWidth;
      
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}