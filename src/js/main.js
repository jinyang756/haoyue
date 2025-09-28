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
import { SkeletonManager } from './modules/skeletonScreens.js';
import { importModule, preloadModules } from './utils/dynamicImport.js';
import { setupLazyLoading as setupImageLazyLoading, preloadImages, isWebPSupported } from './utils/imageOptimizer';
import { AdvancedCacheManager, CachePriority } from './utils/advancedCache';
import { PerformanceMonitor } from './utils/performanceMonitor.js';
import { initPerformancePanel } from './modules/performancePanel.js';
import { routePreloadService } from './services/routePreloadService.js';
import imageAdvancedService, { 
  loadImageWithRetry, 
  preloadImagesWithStrategy, 
  setupSmartImagePreloading, 
  setupProgressiveImageLoading 
} from './services/imageAdvancedService.js';

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
  
  // 3. 初始化骨架屏管理器
  try {
    window.skeletonManager = new SkeletonManager();
    console.log('骨架屏管理器初始化成功');
  } catch (error) {
    console.error('骨架屏管理器初始化失败:', error);
    // 降级处理：仍使用原有的骨架屏初始化
    initSkeletonScreens();
  }
  
  // 4. 注册Service Worker，提供离线访问和高级缓存功能
  registerServiceWorker();
  
  // 5. 暴露动态导入工具到全局
  window.importModule = importModule;
  window.preloadModules = preloadModules;
  window.routePreloadService = routePreloadService;
  
  // 6. 初始化路由预加载服务
  try {
    // 设置链接悬停预加载
    routePreloadService.setupLinkHoverPreload();
    console.log('路由预加载服务初始化成功');
  } catch (error) {
    console.error('路由预加载服务初始化失败:', error);
  }
  
  // 6. 初始化图片优化功能
  initImageOptimizations();
  
  // 7. 初始化高级缓存管理器
  initAdvancedCache();
  
  // 8. 初始化性能监控
  initPerformanceMonitoring();
  
  // 9. 初始化性能控制面板 - 在开发环境下启用
  try {
    if (process.env?.NODE_ENV !== 'production') {
      initPerformancePanel();
      console.log('性能控制面板初始化成功');
    }
  } catch (error) {
    console.error('性能控制面板初始化失败:', error);
  }
  
  console.log('性能优化功能初始化完成');
}

/**
 * 初始化高级缓存管理器
 */
function initAdvancedCache() {
  try {
    // 初始化高级缓存管理器
    AdvancedCacheManager.init();
    console.log('高级缓存管理器初始化成功');
    
    // 全局暴露高级缓存工具
    window.AdvancedCacheManager = AdvancedCacheManager;
    window.CachePriority = CachePriority;
    
    // 为常用API请求设置高级缓存策略
    configureApiCacheStrategies();
    
  } catch (error) {
    console.error('高级缓存管理器初始化失败:', error);
    // 降级处理：继续使用基础缓存服务
  }
}

/**
 * 配置API请求的缓存策略
 */
function configureApiCacheStrategies() {
  try {
    // 示例：配置不同API的缓存策略
    console.log('API缓存策略配置完成');
    
    // 可以在这里添加更多API缓存策略配置
    // 例如：为市场数据、用户数据等设置不同的缓存优先级和过期时间
    
  } catch (error) {
    console.error('API缓存策略配置失败:', error);
  }
}

/**
 * 初始化性能监控功能
 */
function initPerformanceMonitoring() {
  try {
    // 初始化性能监控工具
    const initialized = PerformanceMonitor.init();
    
    if (initialized) {
      console.log('性能监控功能初始化成功');
      
      // 全局暴露性能监控工具
      window.PerformanceMonitor = PerformanceMonitor;
      
      // 为导航功能添加性能标记
      const originalNavigateTo = window.navigateTo;
      window.navigateTo = function(pageId, data) {
        // 创建性能标记
        const startMark = PerformanceMonitor.mark(`navigation_start_${pageId}`);
        
        // 执行原始导航函数
        const result = originalNavigateTo(pageId, data);
        
        // 设置导航完成的测量（通过setTimeout确保在下一个事件循环中执行）
        setTimeout(() => {
          const endMark = PerformanceMonitor.mark(`navigation_end_${pageId}`);
          PerformanceMonitor.measure(`navigation_${pageId}`, `navigation_start_${pageId}`, endMark);
        }, 0);
        
        return result;
      };
      
      // 为常用API请求添加性能监控
      if (window.fetchWithCache) {
        const originalFetchWithCache = window.fetchWithCache;
        window.fetchWithCache = function(url, options = {}) {
          const startTime = performance.now();
          
          // 执行原始的带缓存的fetch
          return originalFetchWithCache(url, options).then(response => {
            const endTime = performance.now();
            // 监控API调用性能
            PerformanceMonitor.monitorApiCall(url, startTime, endTime, response.ok);
            return response;
          }).catch(error => {
            const endTime = performance.now();
            // 记录失败的API调用
            PerformanceMonitor.monitorApiCall(url, startTime, endTime, false);
            throw error;
          });
        };
      }
      
    } else {
      console.log('性能监控未初始化（采样未命中或已禁用）');
    }
  } catch (error) {
    console.error('性能监控初始化失败:', error);
    // 降级处理：不影响主功能
  }
}

/**
 * 初始化图片高级优化功能
 */
function initImageOptimizations() {
  try {
    console.log('初始化图片高级优化服务...');
    
    // 为主要内容区域设置智能图片预加载
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // 设置智能预加载
      const smartPreloadObserver = imageAdvancedService.setupSmartPreloading(mainContent, {
        selector: 'img[data-src]',
        threshold: 300, // 在图片进入视口前300像素就开始智能预加载
        quality: 'medium'
      });
      console.log('智能图片预加载功能初始化成功');
      
      // 设置渐进式加载
      imageAdvancedService.setupProgressiveLoadingForContainer(mainContent, {
        selector: 'img[data-progressive]',
        placeholderQuality: 'low',
        targetQuality: 'high',
        transitionTime: 500
      });
      console.log('渐进式图片加载功能初始化成功');
    }
    
    // 预加载一些关键的、全局使用的图片
    preloadCommonImages();
    
    // 更新图片格式支持状态日志
    const stats = imageAdvancedService.getImageStats();
    console.log('图片格式支持状态:', stats.formatSupport);
    
    // 全局暴露图片优化工具
    window.imageAdvancedService = imageAdvancedService;
    window.setupImageLazyLoading = setupImageLazyLoading;
    window.preloadImages = preloadImages;
    window.loadImageWithRetry = loadImageWithRetry;
    window.setupSmartImagePreloading = setupSmartImagePreloading;
    window.setupProgressiveImageLoading = setupProgressiveImageLoading;
    
  } catch (error) {
    console.error('图片优化功能初始化失败:', error);
    // 降级处理：不影响主功能
  }
}

/**
 * 预加载常用图片
 */
function preloadCommonImages() {
  try {
    // 这里可以添加应用中常用的图片URL
    const commonImages = [
      // 'path/to/common/image1.png',
      // 'path/to/common/image2.png'
    ];
    
    if (commonImages.length > 0) {
      preloadImagesWithStrategy(commonImages, {
        quality: 'medium',
        priority: 'high',
        onProgress: (progress) => {
          console.log(`预加载常用图片 ${progress.index + 1}/${progress.total} - ${progress.success ? '成功' : '失败'}`);
        }
      }).then(results => {
        const successCount = results.filter(r => r.success).length;
        console.log(`常用图片预加载完成: ${successCount}/${results.length} 成功`);
      });
    }
  } catch (error) {
    console.error('预加载常用图片失败:', error);
  }
}

/**
 * 注册Service Worker
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/src/js/serviceWorker.js')
        .then(registration => {
          console.log('Service Worker 注册成功:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
    });
  }
}

/**
 * 初始化骨架屏（降级方案）
 * 当SkeletonManager初始化失败时使用
 */
function initSkeletonScreens() {
  console.log('使用降级方案初始化骨架屏...');
  
  // 为主要页面区域添加骨架屏效果
  const pageSections = document.querySelectorAll('.page-section');
  
  pageSections.forEach(section => {
    // 提取页面ID（移除-page后缀）
    const pageId = section.id.replace('-page', '');
    const skeletonId = `${pageId}-page-skeleton`;
    
    if (document.getElementById(skeletonId)) {
      // 骨架屏已存在，无需创建
      return;
    }
    
    // 创建骨架屏元素
    const skeleton = document.createElement('div');
    skeleton.id = skeletonId;
    skeleton.className = `skeleton-loading fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm hidden transition-opacity duration-300`;
    
    // 根据页面ID生成合适的骨架屏内容
    let skeletonContent = '';
    if (pageId === 'home') {
      skeletonContent = generateHomePageSkeleton();
    } else if (pageId === 'market-list' || pageId === 'quant-stock') {
      skeletonContent = generateMarketListSkeleton();
    } else if (pageId === 'personal-center') {
      skeletonContent = generatePersonalCenterSkeleton();
    } else if (pageId === 'admin-panel') {
      skeletonContent = generateAdminPanelSkeleton();
    } else {
      // 默认骨架屏
      skeletonContent = generateDefaultSkeleton();
    }
    
    skeleton.innerHTML = skeletonContent;
    document.body.appendChild(skeleton);
  });
  
  // 简单的骨架屏生成函数
  function generateDefaultSkeleton() {
    return `
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
          <div class="space-y-4">
            <div class="h-20 bg-gray-800 rounded"></div>
            <div class="h-20 bg-gray-800 rounded"></div>
            <div class="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  // 简化版的页面骨架屏生成函数
  function generateHomePageSkeleton() {
    return `
      <div class="container mx-auto px-4 py-6">
        <div class="animate-pulse">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div class="h-12 bg-gray-800 rounded w-1/4 mb-4 md:mb-0"></div>
            <div class="flex gap-4 w-full md:w-auto">
              <div class="h-10 bg-gray-800 rounded w-24"></div>
              <div class="h-10 bg-gray-800 rounded w-24"></div>
              <div class="h-10 bg-gray-800 rounded w-24"></div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div class="h-12 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div class="h-12 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div class="h-12 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
          
          <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
            <div class="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div class="h-80 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  function generateMarketListSkeleton() {
    return `
      <div class="container mx-auto px-4 py-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div class="overflow-hidden rounded-xl border border-gray-700">
            <div class="grid grid-cols-6 bg-gray-800/80 py-3 px-4">
              ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
            </div>
            ${Array(5).fill().map(() => `
              <div class="grid grid-cols-6 py-3 px-4 border-t border-gray-700">
                ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  function generatePersonalCenterSkeleton() {
    return `
      <div class="container mx-auto px-4 py-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div class="flex flex-col md:flex-row gap-6 mb-8">
            <div class="w-full md:w-1/4 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="flex flex-col items-center mb-6">
                <div class="w-24 h-24 rounded-full bg-gray-700 mb-4"></div>
                <div class="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
              <div class="space-y-3">
                ${Array(5).fill().map(() => `<div class="h-10 bg-gray-700 rounded"></div>`).join('')}
              </div>
            </div>
            <div class="w-full md:w-3/4 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
              <div class="space-y-4">
                ${Array(4).fill().map(() => `<div class="h-16 bg-gray-700 rounded"></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  function generateAdminPanelSkeleton() {
    return `
      <div class="container mx-auto px-4 py-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div class="h-10 bg-gray-700 rounded w-full mb-4"></div>
              <div class="h-10 bg-gray-700 rounded w-full"></div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div class="h-10 bg-gray-700 rounded w-full mb-4"></div>
              <div class="h-10 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
          <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div class="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div class="overflow-hidden rounded-lg border border-gray-700">
              <div class="grid grid-cols-5 bg-gray-800/80 py-3 px-4">
                ${Array(5).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
              </div>
              ${Array(5).fill().map(() => `
                <div class="grid grid-cols-5 py-3 px-4 border-t border-gray-700">
                  ${Array(5).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
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