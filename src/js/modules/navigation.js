// 页面导航功能模块

// 导入骨架屏功能
import { showSkeleton, hideSkeleton } from '../utils/skeletonScreens.js';

// 导入缓存服务
import { CacheService } from '../utils/cacheService.js';

/**
 * 导航到指定页面 - 实现路由级别的懒加载
 * @param {string} pageId - 页面ID
 */
export function navigateTo(pageId) {
  // 检查是否是管理员页面且未登录
  if (pageId === 'admin-panel' && !isAdminLoggedIn()) {
    // 显示登录模态框
    document.getElementById('login-modal').classList.remove('hidden');
    // 切换到管理员登录表单
    document.getElementById('admin-login-tab').click();
    return;
  }
  
  // 显示骨架屏
  showSkeleton(pageId);
  
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
      return loadPageModule(pageId);
    })
    .catch(error => {
      console.error(`导航到页面${pageId}失败:`, error);
      // 即使出错也要隐藏骨架屏
      setTimeout(() => hideSkeleton(pageId), 500);
    });
}

/**
 * 动态加载页面模块
 * @param {string} pageId - 页面ID
 */
async function loadPageModule(pageId) {
  try {
    console.log(`开始加载页面模块: ${pageId}`);
    
    // 延迟隐藏骨架屏，确保用户看到加载状态
    setTimeout(() => hideSkeleton(pageId), 500);
    
    // 根据页面ID加载对应的模块
    let module;
    switch(pageId) {
      case 'home':
        module = await import('./pages/homePage.js');
        if (module.initHomePage) module.initHomePage();
        break;
      case 'market-list':
        module = await import('./pages/marketListPage.js');
        if (module.initMarketList) module.initMarketList();
        break;
      case 'quant-stock':
        module = await import('./pages/quantStockPage.js');
        if (module.initQuantStock) module.initQuantStock();
        break;
      case 'charity':
        module = await import('./pages/charityPage.js');
        if (module.initCharityPage) module.initCharityPage();
        break;
      case 'platform-intro':
        module = await import('./pages/platformIntroPage.js');
        if (module.initPlatformIntro) module.initPlatformIntro();
        break;
      case 'personal-center':
        module = await import('./pages/personalCenterPage.js');
        if (module.initPersonalCenter) module.initPersonalCenter();
        break;
      case 'api-doc':
        module = await import('./pages/apiDocPage.js');
        if (module.initApiDoc) module.initApiDoc();
        break;
      case 'admin-panel':
        module = await import('./pages/adminPanelPage.js');
        if (module.initAdminPanel) module.initAdminPanel();
        break;
      default:
        console.log(`No specific module found for page: ${pageId}`);
    }
    
    console.log(`页面模块加载完成: ${pageId}`);
    
    // 触发页面切换事件，通知其他组件
    const pageChangeEvent = new CustomEvent('pageChange', { detail: { pageId } });
    window.dispatchEvent(pageChangeEvent);
    
  } catch (error) {
    console.error(`Error loading module for ${pageId}:`, error);
    // 显示错误提示
    showErrorNotification(`加载页面失败: ${error.message}`);
  }
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