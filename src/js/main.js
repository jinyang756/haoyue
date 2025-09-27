// 皓月AI智能引擎主入口

// 导入模块
import { initAuthUI, checkLoginStatus, checkAdminStatus } from './modules/authModule.js';
import { initBlackholeEntry } from './modules/blackholeEntry.js';
import { initMarketIndexCharts, initBacktestChart } from './modules/chartModule.js';
import { initContentGeneration, initBacktest, initDonation } from './modules/contentGeneration.js';
import { initNavigation, navigateTo } from './modules/navigation.js';
import { typingEffect, initMouseFollowEffect, initScrollReveal } from './utils/animation.js';
import { sanitizeInput } from './utils/security.js';

// 全局导航函数（供其他模块使用）
window.navigateTo = navigateTo;

// 应用初始化函数
function initApp() {
  // 1. 初始化认证系统
  const auth = initAuthUI();
  
  // 2. 初始化黑洞入口和粒子效果
  initBlackholeEntry();
  
  // 3. 初始化导航系统
  initNavigation();
  
  // 4. 初始化图表系统
  initChartSystem();
  
  // 5. 初始化内容生成和回测功能
  initContentGeneration();
  initBacktest();
  initDonation();
  
  // 6. 初始化动画效果
  initAnimationEffects();
  
  // 7. 初始化搜索功能
  initSearchFunction();
  
  // 8. 确保页面正确显示
  document.body.style.overflow = 'hidden'; // 初始隐藏滚动条
}

// 初始化图表系统
function initChartSystem() {
  // 延迟初始化以提高首屏加载速度
  setTimeout(() => {
    initMarketIndexCharts();
  }, 500);
}

// 初始化动画效果
function initAnimationEffects() {
  // 页面加载完成后初始化动画效果
  document.addEventListener('DOMContentLoaded', () => {
    // 初始化滚动渐入效果
    initScrollReveal();
    
    // 初始化打字效果
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
      setTimeout(() => {
        const typingElement = document.getElementById('typing-text');
        if (typingElement) {
          typingEffect(
            typingElement,
            ['量化智能引擎', '投资决策系统', '智能选股工具'],
            80, 
            1000
          );
        }
      }, 100);
    }
    
    // 初始化鼠标跟随效果
    const mouseFollowContainer = document.getElementById('mouse-follow-container');
    if (mouseFollowContainer) {
      initMouseFollowEffect(mouseFollowContainer);
    }
  });
}

// 初始化搜索功能
function initSearchFunction() {
  // 搜索功能 - 添加输入验证
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      const searchTerm = sanitizeInput(searchInput.value.trim());
      if (searchTerm) {
        alert(`搜索: ${searchTerm}`);
        // 实际应用中这里应该执行搜索逻辑
      }
    });
    
    // 按Enter键搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化以优化首屏加载性能
  setTimeout(initApp, 100);
});

// 导出常用函数供外部使用
export { checkLoginStatus, checkAdminStatus };