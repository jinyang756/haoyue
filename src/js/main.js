// 皓月AI智能引擎主入口

// 导入模块
import { initAuthUI, checkLoginStatus, checkAdminStatus } from './modules/authModule.js';
import { initBlackholeEntry } from './modules/blackholeEntry.js';
import { initMarketIndexCharts, initBacktestChart } from './modules/chartModule.js';
import { initContentGeneration, initBacktest, initDonation } from './modules/contentGeneration.js';
import { initNavigation, navigateTo } from './modules/navigation.js';
import { typingEffect, initMouseFollowEffect, initScrollReveal } from './utils/animation.js';
import { sanitizeInput } from './utils/security.js';

// 性能优化相关导入
import { CacheService, fetchWithCache } from './utils/cacheService.js';
import { initLazyLoad, addLazyLoad } from './utils/lazyLoad.js';

// 全局导航函数（供其他模块使用）
window.navigateTo = navigateTo;

// 应用初始化函数
function initApp() {
  // 1. 初始化性能优化功能
  initPerformanceOptimizations();
  
  // 2. 初始化认证系统
  const auth = initAuthUI();
  
  // 3. 初始化黑洞入口和粒子效果
  initBlackholeEntry();
  
  // 4. 初始化导航系统
  initNavigation();
  
  // 5. 初始化图表系统
  initChartSystem();
  
  // 6. 初始化内容生成和回测功能
  initContentGeneration();
  initBacktest();
  initDonation();
  
  // 7. 初始化动画效果
  initAnimationEffects();
  
  // 8. 初始化搜索功能
  initSearchFunction();
  
  // 9. 确保页面正确显示
  document.body.style.overflow = 'hidden'; // 初始隐藏滚动条
}

/**
 * 初始化性能优化功能
 */
function initPerformanceOptimizations() {
  console.log('初始化性能优化功能...');
  
  // 1. 初始化图片懒加载
  try {
    initLazyLoad();
    console.log('图片懒加载功能初始化成功');
  } catch (error) {
    console.error('图片懒加载初始化失败:', error);
  }
  
  // 2. 将缓存服务和带缓存的fetch暴露到全局，方便其他模块使用
  window.CacheService = CacheService;
  window.fetchWithCache = fetchWithCache;
  
  // 3. 初始化骨架屏（如果需要）
  initSkeletonScreens();
  
  console.log('性能优化功能初始化完成');
}

/**
 * 初始化骨架屏
 */
function initSkeletonScreens() {
  // 可以在这里添加骨架屏的初始化逻辑
  // 为主要页面区域添加骨架屏效果
  const pageSections = document.querySelectorAll('.page-section');
  
  pageSections.forEach(section => {
    // 为每个页面区域添加加载状态类
    const skeletonClass = `${section.id}-skeleton`;
    if (document.getElementById(skeletonClass)) {
      // 骨架屏已存在，无需创建
      return;
    }
    
    // 简单的骨架屏实现
    const skeleton = document.createElement('div');
    skeleton.id = skeletonClass;
    skeleton.className = `skeleton-loading fixed inset-0 z-40 bg-gray-900/90 hidden`;
    skeleton.innerHTML = `
      <div class="container mx-auto px-4 py-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-800 rounded-lg p-4 h-48"></div>
            <div class="bg-gray-800 rounded-lg p-4 h-48"></div>
            <div class="bg-gray-800 rounded-lg p-4 h-48"></div>
          </div>
          <div class="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div class="h-64 bg-gray-800 rounded mb-6"></div>
          <div class="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div class="space-y-4">
            <div class="h-20 bg-gray-800 rounded"></div>
            <div class="h-20 bg-gray-800 rounded"></div>
            <div class="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(skeleton);
  });
}

/**
 * 显示骨架屏
 * @param {string} pageId - 页面ID
 */
export function showSkeleton(pageId) {
  const skeleton = document.getElementById(`${pageId}-page-skeleton`);
  if (skeleton) {
    skeleton.classList.remove('hidden');
  }
}

/**
 * 隐藏骨架屏
 * @param {string} pageId - 页面ID
 */
export function hideSkeleton(pageId) {
  const skeleton = document.getElementById(`${pageId}-page-skeleton`);
  if (skeleton) {
    skeleton.classList.add('hidden');
  }
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