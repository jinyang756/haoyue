/**
 * 动态导入工具 - 实现代码的按需加载和懒加载
 */

/**
 * 动态导入模块
 * @param {string} modulePath - 模块路径
 * @param {Object} options - 选项配置
 * @param {boolean} options.showLoading - 是否显示加载状态
 * @param {string} options.loadingMessage - 加载提示信息
 * @param {string} options.pageId - 页面ID，用于骨架屏显示
 * @returns {Promise<any>} - 返回模块的Promise
 */
export async function importModule(modulePath, options = {}) {
  const { showLoading = false, loadingMessage = '加载中...', pageId = null } = options;
  let loadingIndicator = null;
  
  try {
    // 显示加载状态
    if (showLoading) {
      loadingIndicator = createLoadingIndicator(loadingMessage);
    }
    
    // 显示骨架屏
    if (pageId && window.skeletonManager) {
      window.skeletonManager.showSkeleton(pageId);
    }
    
    // 添加模块路径前缀（如果需要）
    const fullPath = modulePath.startsWith('.') ? modulePath : `../modules/${modulePath}`;
    
    // 动态导入模块
    // 使用@vite-ignore注释告诉Vite不要分析这个动态导入路径
    const module = await import(/* @vite-ignore */ fullPath);
    
    return module;
  } catch (error) {
    console.error(`模块加载失败: ${modulePath}`, error);
    throw error;
  } finally {
    // 隐藏加载状态
    if (loadingIndicator) {
      removeLoadingIndicator(loadingIndicator);
    }
    
    // 隐藏骨架屏
    if (pageId && window.skeletonManager) {
      // 稍微延迟隐藏，确保内容已渲染
      setTimeout(() => {
        window.skeletonManager.hideSkeleton(pageId);
      }, 100);
    }
  }
}

/**
 * 预加载模块
 * @param {Array<string>} modulePaths - 模块路径数组
 * @param {number} delay - 延迟时间（毫秒）
 */
export function preloadModules(modulePaths, delay = 1000) {
  // 延迟执行预加载，避免影响首屏加载
  setTimeout(() => {
    modulePaths.forEach(path => {
      // 使用link预加载
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'script';
      document.head.appendChild(link);
      
      // 监听load事件，移除link元素
      link.onload = () => {
        document.head.removeChild(link);
      };
    });
  }, delay);
}

/**
 * 创建加载指示器
 * @param {string} message - 加载消息
 * @returns {HTMLElement} - 加载指示器元素
 */
function createLoadingIndicator(message) {
  const indicator = document.createElement('div');
  indicator.id = 'dynamic-loading-indicator';
  indicator.className = 'fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm';
  
  indicator.innerHTML = `
    <div class="bg-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-lg max-w-xs w-full flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <div class="text-gray-300 font-medium">${message}</div>
    </div>
  `;
  
  document.body.appendChild(indicator);
  return indicator;
}

/**
 * 移除加载指示器
 * @param {HTMLElement} indicator - 加载指示器元素
 */
function removeLoadingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

/**
 * 路由预加载策略
 * 根据当前路由预加载可能需要的模块
 * @param {string} currentRoute - 当前路由
 */
export function preloadModulesByRoute(currentRoute) {
  const preloadMap = {
    'home': [
      '../modules/chartModule.js',
      '../modules/contentGeneration.js'
    ],
    'market-list': [
      '../modules/chartModule.js'
    ],
    'stock-detail': [
      '../modules/chartModule.js'
    ],
    'quant-stock': [
      '../modules/chartModule.js',
      '../modules/contentGeneration.js'
    ],
    'personal-center': [],
    'admin-panel': [
      '../modules/contentGeneration.js'
    ]
  };
  
  const modulesToPreload = preloadMap[currentRoute] || [];
  if (modulesToPreload.length > 0) {
    preloadModules(modulesToPreload);
  }
}

/**
 * 图片动态导入工具
 * @param {string} src - 图片源路径
 * @param {Object} options - 选项配置
 * @returns {Promise<HTMLImageElement>} - 返回图片元素的Promise
 */
export function loadImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // 设置选项
    if (options.crossOrigin) {
      image.crossOrigin = options.crossOrigin;
    }
    
    // 设置加载成功事件
    image.onload = () => {
      resolve(image);
    };
    
    // 设置加载失败事件
    image.onerror = (error) => {
      reject(error);
    };
    
    // 开始加载图片
    image.src = src;
  });
}

/**
 * 批量动态导入模块
 * @param {Array<string>} modulePaths - 模块路径数组
 * @param {Object} options - 选项配置
 * @returns {Promise<Array<any>>} - 返回模块数组的Promise
 */
export async function importModules(modulePaths, options = {}) {
  const promises = modulePaths.map(path => importModule(path, options));
  return Promise.all(promises);
}

// 默认导出
export default {
  importModule,
  preloadModules,
  preloadModulesByRoute,
  loadImage,
  importModules
};