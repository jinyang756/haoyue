// 页面导航功能模块

// 导入骨架屏功能
import { showSkeleton, hideSkeleton } from '../utils/skeletonScreens.js';

// 导入缓存服务
import { CacheService } from '../utils/cacheService.js';

// 导入动态导入工具
import { importModule, preloadModules } from '../utils/dynamicImport.js';

// 导入路由预加载服务
import { routePreloadService } from '../services/routePreloadService.js';

/**
 * 导航到指定页面 - 实现路由级别的懒加载
 * @param {string} pageId - 页面ID
 * @param {object} params - 导航参数（可选）
 */
export function navigateTo(pageId, params = {}) {
  // 检查是否是管理员页面且未登录
  if (pageId === 'admin-panel' && !isAdminLoggedIn()) {
    // 显示登录模态框
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.remove('hidden');
      // 切换到管理员登录表单
      const adminTab = document.getElementById('admin-login-tab');
      if (adminTab) {
        adminTab.click();
      }
    }
    return;
  }
  
  // 显示骨架屏
  showSkeleton(pageId);
  
  // 设置加载状态
  document.body.classList.add('page-transitioning');
  
  // 隐藏所有页面
  document.querySelectorAll('.page-section').forEach(page => {
    page.classList.add('hidden');
  });
  
  // 尝试从缓存获取页面数据
  const cachedPageData = CacheService.getCache(`page_data_${pageId}`);
  
  // 预加载页面模块，显示页面
  Promise.resolve()
    .then(() => {
      // 显示目标页面
      const targetPage = document.getElementById(`${pageId}-page`);
      if (targetPage) {
        targetPage.classList.remove('hidden');
      }
      
      // 更新底部导航栏状态
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
          link.classList.add('active');
        }
      });
      
      // 如果有缓存数据，先应用缓存数据
      if (cachedPageData) {
        applyCachedPageData(pageId, cachedPageData);
      }
      
      // 动态加载页面所需的JavaScript模块
      return loadPageModule(pageId, params);
    })
    .catch(error => {
      console.error(`导航到页面${pageId}失败:`, error);
      // 即使出错也要隐藏骨架屏
      setTimeout(() => hideSkeleton(pageId), 500);
      document.body.classList.remove('page-transitioning');
      
      // 降级显示错误页面
      showErrorPage(pageId, error);
    });
}

/**
 * 动态加载页面模块
 * @param {string} pageId - 页面ID
 * @param {object} params - 导航参数
 */
async function loadPageModule(pageId, params = {}) {
  try {
    console.log(`开始加载页面模块: ${pageId}`);
    
    // 根据页面ID加载对应的模块
    const modulePath = `./pages/${pageId}Page.js`;
    const module = await importModule(modulePath, {
      loadingId: `${pageId}-page`,
      retries: 2,
      retryDelay: 500,
      onRetry: (attempt) => {
        console.warn(`加载页面 ${pageId} 失败，正在进行第 ${attempt} 次重试...`);
      }
    });
    
    // 初始化页面
    if (module) {
      const initMethod = getInitMethodForPage(pageId);
      if (initMethod && typeof module[initMethod] === 'function') {
        // 使用requestAnimationFrame确保平滑初始化
        requestAnimationFrame(() => {
          try {
            const initResult = module[initMethod](params);
            // 处理异步初始化方法
            if (initResult && typeof initResult.then === 'function') {
              initResult.catch(initError => {
                console.error(`初始化页面 ${pageId} 失败:`, initError);
                showErrorNotification(`页面初始化失败: ${initError.message}`);
              });
            }
          } catch (initError) {
            console.error(`初始化页面 ${pageId} 失败:`, initError);
            showErrorNotification(`页面初始化失败: ${initError.message}`);
          }
        });
      }
    }
    
    console.log(`页面模块加载完成: ${pageId}`);
    
    // 延迟隐藏骨架屏，确保用户看到加载状态
    setTimeout(() => hideSkeleton(pageId), 500);
    document.body.classList.remove('page-transitioning');
    
    // 预加载相关模块
    setTimeout(() => {
      preloadRelatedModules(pageId);
    }, 300);
    
    // 触发页面切换事件，通知其他组件
    const pageChangeEvent = new CustomEvent('pageChange', { detail: { pageId, params } });
    window.dispatchEvent(pageChangeEvent);
    
  } catch (error) {
    console.error(`Error loading module for ${pageId}:`, error);
    // 显示错误提示
    showErrorNotification(`加载页面失败: ${error.message}`);
    hideSkeleton(pageId);
    document.body.classList.remove('page-transitioning');
    
    // 降级显示错误页面
    showErrorPage(pageId, error);
  }
}

/**
 * 获取页面的初始化方法名
 * @param {string} pageId - 页面ID
 * @returns {string} - 初始化方法名
 */
function getInitMethodForPage(pageId) {
  const methodMap = {
    'home': 'initHomePage',
    'market-list': 'initMarketList',
    'quant-stock': 'initQuantStock',
    'charity': 'initCharityPage',
    'platform-intro': 'initPlatformIntro',
    'personal-center': 'initPersonalCenter',
    'api-doc': 'initApiDoc',
    'admin-panel': 'initAdminPanel'
  };
  
  return methodMap[pageId] || '';
}

/**
 * 根据页面ID预加载相关模块
 * @param {string} pageId - 当前页面ID
 */
function preloadRelatedModules(pageId) {
  try {
    // 使用新的路由预加载服务来预加载相关模块
    routePreloadService.preloadByRoute(pageId);
    console.log(`路由预加载服务已为页面 ${pageId} 启动预加载`);
  } catch (error) {
    console.error('预加载相关模块失败:', error);
    // 降级处理：使用基础的预加载功能
    try {
      const relatedModules = [];
      
      switch (pageId) {
        case 'home':
          relatedModules.push('./pages/marketListPage.js');
          relatedModules.push('./pages/quantStockPage.js');
          break;
        case 'market-list':
          relatedModules.push('./pages/quantStockPage.js');
          relatedModules.push('./pages/personalCenterPage.js');
          break;
        case 'quant-stock':
          relatedModules.push('./pages/marketListPage.js');
          break;
        case 'personal-center':
          relatedModules.push('./pages/homePage.js');
          break;
        case 'admin-panel':
          relatedModules.push('./pages/marketListPage.js');
          break;
      }
      
      // 预加载模块
      if (relatedModules.length > 0) {
        preloadModules(relatedModules);
      }
    } catch (fallbackError) {
      console.error('降级预加载也失败:', fallbackError);
    }
  }
}

/**
 * 显示错误页面
 * @param {string} pageId - 页面ID
 * @param {Error} error - 错误对象
 */
function showErrorPage(pageId, error) {
  const targetPage = document.getElementById(`${pageId}-page`);
  if (!targetPage) return;
  
  targetPage.innerHTML = `
    <div class="error-page container mx-auto px-4 py-16 text-center">
      <div class="error-icon text-red-500 text-8xl mb-6">⚠️</div>
      <h2 class="text-3xl font-bold mb-4">页面加载失败</h2>
      <p class="text-gray-400 mb-8 max-w-md mx-auto">
        无法加载页面 "${pageId}"。请检查您的网络连接或稍后再试。
      </p>
      <button id="retry-button" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors">
        重试
      </button>
    </div>
  `;
  
  // 添加重试按钮事件
  setTimeout(() => {
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        navigateTo(pageId);
      });
    }
  }, 100);
}

/**
 * 应用缓存的页面数据
 * @param {string} pageId - 页面ID
 * @param {Object} data - 缓存的数据
 */
function applyCachedPageData(pageId, data) {
  console.log(`应用缓存数据到页面: ${pageId}`);
  
  // 这里可以根据不同页面类型实现特定的数据应用逻辑
  try {
    // 例如，如果是市场列表页面，可以应用缓存的股票数据
    if (pageId === 'market-list' && data.stocks) {
      const stocksTable = document.querySelector('#market-list-page table tbody');
      if (stocksTable) {
        // 简单实现，实际项目中可能需要更复杂的渲染逻辑
        console.log(`应用缓存的股票数据，共${data.stocks.length}条`);
      }
    }
    
    // 如果是首页，可以应用缓存的市场指数数据
    if (pageId === 'home' && data.marketIndices) {
      console.log(`应用缓存的市场指数数据`);
    }
  } catch (error) {
    console.error(`应用缓存数据失败:`, error);
  }
}

/**
 * 显示错误通知
 * @param {string} message - 错误消息
 */
function showErrorNotification(message) {
  // 检查是否已有通知元素
  let notification = document.getElementById('error-notification');
  
  if (!notification) {
    // 创建通知元素
    notification = document.createElement('div');
    notification.id = 'error-notification';
    notification.className = 'fixed bottom-4 right-4 bg-red-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-y-20 opacity-0 transition-all duration-300';
    document.body.appendChild(notification);
  }
  
  // 设置消息内容
  notification.textContent = message;
  
  // 显示通知
  setTimeout(() => {
    notification.classList.remove('translate-y-20', 'opacity-0');
  }, 10);
  
  // 3秒后隐藏通知
  setTimeout(() => {
    notification.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

/**
 * 检查管理员是否已登录
 * @returns {boolean} - 登录状态
 */
export function isAdminLoggedIn() {
  try {
    // 从安全存储中检查管理员登录状态
    const adminStatus = CacheService.getCache('admin_login_status');
    if (adminStatus && adminStatus.isLoggedIn) {
      return true;
    }
    
    // 备用检查方式
    return !document.getElementById('admin-panel-page')?.classList.contains('hidden');
  } catch (error) {
    console.error('检查管理员登录状态失败:', error);
    return false;
  }
}

/**
 * 初始化导航事件监听
 */
export function initNavigation() {
  // 底部导航栏点击事件
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navigateTo(link.dataset.page);
    });
  });
  
  // 移动端菜单切换
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
  });
}

/**
 * 当前日期和时间更新
 */
export function updateDateTime() {
  const now = new Date();
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  
  document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', dateOptions);
  document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-CN', timeOptions);
}

/**
 * 初始化日期时间更新
 */
export function initDateTime() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}