/**
 * 路由预加载服务 - 实现智能的路由级预加载策略
 */

import { preloadModules } from '../utils/dynamicImport.js';

/**
 * 路由预加载服务类
 */
export class RoutePreloadService {
  constructor() {
    this.preloadMap = this.initializePreloadMap();
    this.activePreloads = new Set();
    this.throttleTimeout = null;
  }

  /**
   * 初始化预加载映射表
   */
  initializePreloadMap() {
    return {
      'home': {
        relatedRoutes: ['market-list', 'quant-stock'],
        priority: 'high',
        delay: 500
      },
      'market-list': {
        relatedRoutes: ['quant-stock', 'personal-center', 'stock-detail'],
        priority: 'medium',
        delay: 800
      },
      'quant-stock': {
        relatedRoutes: ['market-list', 'personal-center'],
        priority: 'medium',
        delay: 800
      },
      'personal-center': {
        relatedRoutes: ['home', 'market-list'],
        priority: 'medium',
        delay: 1000
      },
      'charity': {
        relatedRoutes: ['home'],
        priority: 'low',
        delay: 1500
      },
      'platform-intro': {
        relatedRoutes: ['home', 'api-doc'],
        priority: 'low',
        delay: 1500
      },
      'api-doc': {
        relatedRoutes: ['home', 'platform-intro'],
        priority: 'low',
        delay: 1500
      },
      'admin-panel': {
        relatedRoutes: ['market-list', 'personal-center'],
        priority: 'medium',
        delay: 1000
      }
    };
  }

  /**
   * 根据当前路由预加载相关模块
   * @param {string} currentRoute - 当前路由
   */
  preloadByRoute(currentRoute) {
    // 节流处理，避免短时间内多次调用
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }

    this.throttleTimeout = setTimeout(() => {
      this._executePreload(currentRoute);
    }, 300);
  }

  /**
   * 执行预加载
   * @private
   * @param {string} currentRoute - 当前路由
   */
  _executePreload(currentRoute) {
    // 清除之前的活跃预加载
    this.activePreloads.clear();

    const routeConfig = this.preloadMap[currentRoute];
    if (!routeConfig) {
      console.warn(`没有为路由 ${currentRoute} 配置预加载策略`);
      return;
    }

    const { relatedRoutes, priority, delay } = routeConfig;
    const modulesToPreload = [];

    // 收集相关路由的页面模块
    relatedRoutes.forEach(routeId => {
      const modulePath = `../modules/pages/${routeId.replace('-', '')}Page.js`;
      modulesToPreload.push(modulePath);
      this.activePreloads.add(modulePath);
    });

    if (modulesToPreload.length > 0) {
      // 根据优先级调整预加载行为
      const preloadOptions = {
        priority: priority,
        reason: `路由 ${currentRoute} 的相关页面预加载`
      };

      console.log(`预加载策略: ${preloadOptions.reason}`, modulesToPreload);
      
      // 执行预加载，应用适当的延迟
      preloadModules(modulesToPreload, delay);
    }
  }

  /**
   * 取消当前的预加载任务
   */
  cancelActivePreloads() {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
    this.activePreloads.clear();
    console.log('已取消所有活跃的预加载任务');
  }

  /**
   * 监听链接悬停，预加载目标页面
   * @param {HTMLElement} container - 要监听的容器元素
   */
  setupLinkHoverPreload(container = document.body) {
    // 监听所有导航链接的悬停事件
    container.addEventListener('mouseenter', (event) => {
      const navLink = event.target.closest('.nav-link[data-page]');
      if (navLink && !navLink.classList.contains('active')) {
        const pageId = navLink.dataset.page;
        this.preloadSpecificRoute(pageId);
      }
    });
  }

  /**
   * 预加载特定的路由模块
   * @param {string} routeId - 路由ID
   */
  preloadSpecificRoute(routeId) {
    const modulePath = `../modules/pages/${routeId.replace('-', '')}Page.js`;
    
    // 避免重复预加载
    if (this.activePreloads.has(modulePath)) {
      return;
    }

    // 快速预加载，优先级高
    preloadModules([modulePath], 100);
    this.activePreloads.add(modulePath);
    console.log(`快速预加载路由模块: ${routeId}`);
  }

  /**
   * 获取当前活跃的预加载任务
   */
  getActivePreloads() {
    return Array.from(this.activePreloads);
  }
}

// 创建并导出单例实例
export const routePreloadService = new RoutePreloadService();

export default routePreloadService;