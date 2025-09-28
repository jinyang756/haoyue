/**
 * 骨架屏系统 - 提供页面加载状态的视觉反馈
 */

/**
 * 骨架屏管理器类
 */
export class SkeletonManager {
  constructor() {
    this.skeletons = new Map();
    this.initSkeletons();
  }

  /**
   * 初始化所有骨架屏
   */
  initSkeletons() {
    // 为不同页面创建骨架屏
    this.registerSkeleton('home', generateHomePageSkeleton);
    this.registerSkeleton('market-list', generateMarketListSkeleton);
    this.registerSkeleton('stock-detail', generateStockDetailSkeleton);
    this.registerSkeleton('quant-stock', generateQuantStockSkeleton);
    this.registerSkeleton('personal-center', generatePersonalCenterSkeleton);
    this.registerSkeleton('admin-panel', generateAdminPanelSkeleton);
  }

  /**
   * 注册骨架屏
   * @param {string} pageId - 页面ID
   * @param {Function} generator - 骨架屏生成函数
   */
  registerSkeleton(pageId, generator) {
    this.skeletons.set(pageId, generator);
  }

  /**
   * 生成并显示指定页面的骨架屏
   * @param {string} pageId - 页面ID
   */
  showSkeleton(pageId) {
    const skeletonId = `${pageId}-page-skeleton`;
    let skeletonElement = document.getElementById(skeletonId);

    // 如果骨架屏不存在，创建它
    if (!skeletonElement) {
      skeletonElement = this.createSkeletonElement(skeletonId, pageId);
      if (!skeletonElement) return;
    }

    // 显示骨架屏
    skeletonElement.classList.remove('hidden');
  }

  /**
   * 隐藏指定页面的骨架屏
   * @param {string} pageId - 页面ID
   */
  hideSkeleton(pageId) {
    const skeletonId = `${pageId}-page-skeleton`;
    const skeletonElement = document.getElementById(skeletonId);
    
    if (skeletonElement) {
      skeletonElement.classList.add('hidden');
    }
  }

  /**
   * 创建骨架屏元素
   * @param {string} skeletonId - 骨架屏ID
   * @param {string} pageId - 页面ID
   * @returns {HTMLElement|null} - 骨架屏元素
   */
  createSkeletonElement(skeletonId, pageId) {
    const generator = this.skeletons.get(pageId);
    
    if (!generator) {
      // 如果没有特定页面的骨架屏，使用默认骨架屏
      return this.createDefaultSkeleton(skeletonId);
    }

    const skeletonElement = document.createElement('div');
    skeletonElement.id = skeletonId;
    skeletonElement.className = 'skeleton-loading fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm hidden transition-opacity duration-300';
    skeletonElement.innerHTML = generator();
    
    document.body.appendChild(skeletonElement);
    return skeletonElement;
  }

  /**
   * 创建默认骨架屏
   * @param {string} skeletonId - 骨架屏ID
   * @returns {HTMLElement} - 默认骨架屏元素
   */
  createDefaultSkeleton(skeletonId) {
    const skeletonElement = document.createElement('div');
    skeletonElement.id = skeletonId;
    skeletonElement.className = 'skeleton-loading fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm hidden transition-opacity duration-300';
    skeletonElement.innerHTML = `
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
    
    document.body.appendChild(skeletonElement);
    return skeletonElement;
  }
}

/**
 * 生成首页骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generateHomePageSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 头部 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div class="h-12 bg-gray-800 rounded w-1/4 mb-4 md:mb-0"></div>
          <div class="flex gap-4 w-full md:w-auto">
            <div class="h-10 bg-gray-800 rounded w-24"></div>
            <div class="h-10 bg-gray-800 rounded w-24"></div>
            <div class="h-10 bg-gray-800 rounded w-24"></div>
          </div>
        </div>
        
        <!-- 市场概览卡片 -->
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
        
        <!-- 主要图表区域 -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <div class="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div class="h-80 bg-gray-700 rounded"></div>
        </div>
        
        <!-- 热门股票列表 -->
        <div class="mb-8">
          <div class="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div class="overflow-hidden rounded-xl border border-gray-700">
            <!-- 表头 -->
            <div class="grid grid-cols-6 bg-gray-800/80 py-3 px-4">
              ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
            </div>
            <!-- 表体 -->
            ${Array(5).fill().map(() => `
              <div class="grid grid-cols-6 py-3 px-4 border-t border-gray-700">
                ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 量化选股推荐 -->
        <div>
          <div class="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${Array(4).fill().map(() => `
              <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div class="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="h-4 bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-700 rounded w-full"></div>
                </div>
                <div class="h-4 bg-gray-700 rounded w-full"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成市场列表骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generateMarketListSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 头部 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div class="h-12 bg-gray-800 rounded w-1/3 mb-4 md:mb-0"></div>
          <div class="relative w-full md:w-1/3">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div class="h-4 w-4 bg-gray-700 rounded-full"></div>
            </div>
            <div class="h-10 bg-gray-800 rounded w-full pl-10"></div>
          </div>
        </div>
        
        <!-- 筛选标签 -->
        <div class="flex flex-wrap gap-2 mb-6">
          ${Array(8).fill().map(() => `
            <div class="h-8 bg-gray-800 rounded-full px-4 flex items-center">
              <div class="h-3 bg-gray-700 rounded w-12"></div>
            </div>
          `).join('')}
        </div>
        
        <!-- 股票列表 -->
        <div class="overflow-hidden rounded-xl border border-gray-700 mb-6">
          <!-- 表头 -->
          <div class="grid grid-cols-8 bg-gray-800/80 py-3 px-4">
            ${Array(8).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
          </div>
          <!-- 表体 -->
          ${Array(10).fill().map(() => `
            <div class="grid grid-cols-8 py-3 px-4 border-t border-gray-700">
              ${Array(8).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
            </div>
          `).join('')}
        </div>
        
        <!-- 分页 -->
        <div class="flex justify-center items-center gap-2">
          ${Array(5).fill().map(() => `
            <div class="h-8 w-8 bg-gray-800 rounded flex items-center justify-center">
              <div class="h-3 w-3 bg-gray-700 rounded-full"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成股票详情骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generateStockDetailSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 股票基本信息 -->
        <div class="mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="h-12 bg-gray-800 rounded w-1/4"></div>
                <div class="h-6 bg-gray-800 rounded w-16"></div>
              </div>
              <div class="h-8 bg-gray-800 rounded w-1/3 mb-2"></div>
              <div class="h-4 bg-gray-800 rounded w-1/4"></div>
            </div>
            <div class="flex gap-4 mt-4 md:mt-0">
              <div class="h-10 bg-gray-800 rounded w-24"></div>
              <div class="h-10 bg-gray-800 rounded w-24"></div>
            </div>
          </div>
          
          <!-- 价格信息 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            ${Array(5).fill().map(() => `
              <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div class="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div class="h-8 bg-gray-700 rounded w-2/3 mb-1"></div>
                <div class="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 图表区域 -->
        <div class="mb-8">
          <div class="flex flex-wrap gap-2 mb-4">
            ${Array(6).fill().map(() => `
              <div class="h-8 bg-gray-800 rounded px-3 flex items-center">
                <div class="h-3 bg-gray-700 rounded w-10"></div>
              </div>
            `).join('')}
          </div>
          <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div class="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
        
        <!-- 股票详情标签页 -->
        <div>
          <!-- 标签头 -->
          <div class="flex border-b border-gray-700 mb-6">
            ${Array(4).fill().map(() => `
              <div class="h-12 bg-gray-800/50 px-6 flex items-center border-b-2 border-transparent">
                <div class="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            `).join('')}
          </div>
          
          <!-- 标签内容 -->
          <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- 财务指标 -->
              <div>
                <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div class="space-y-4">
                  ${Array(8).fill().map(() => `
                    <div class="grid grid-cols-2 gap-4">
                      <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                      <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <!-- 公司简介 -->
              <div>
                <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div class="space-y-3">
                  ${Array(5).fill().map(() => `
                    <div class="h-4 bg-gray-700 rounded w-full"></div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <!-- 股东结构 -->
            <div class="mb-6">
              <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div class="overflow-hidden rounded-xl border border-gray-700">
                <div class="grid grid-cols-4 bg-gray-800/80 py-3 px-4">
                  ${Array(4).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
                </div>
                ${Array(5).fill().map(() => `
                  <div class="grid grid-cols-4 py-3 px-4 border-t border-gray-700">
                    ${Array(4).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成量化选股骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generateQuantStockSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 头部 -->
        <div class="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
        
        <!-- 筛选条件 -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${Array(6).fill().map(() => `
              <div>
                <div class="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div class="h-10 bg-gray-700 rounded w-full"></div>
              </div>
            `).join('')}
          </div>
          <div class="flex justify-center mt-6">
            <div class="h-12 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        
        <!-- 回测结果 -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <div class="h-6 bg-gray-700 rounded w-1/4"></div>
            <div class="h-8 bg-gray-700 rounded w-24"></div>
          </div>
          <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div class="h-80 bg-gray-700 rounded mb-6"></div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              ${Array(4).fill().map(() => `
                <div class="bg-gray-800/80 rounded-lg p-4">
                  <div class="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div class="h-8 bg-gray-700 rounded w-2/3"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- 选股结果列表 -->
        <div>
          <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="overflow-hidden rounded-xl border border-gray-700">
            <div class="grid grid-cols-6 bg-gray-800/80 py-3 px-4">
              ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
            </div>
            ${Array(10).fill().map(() => `
              <div class="grid grid-cols-6 py-3 px-4 border-t border-gray-700">
                ${Array(6).fill().map(() => `<div class="h-4 bg-gray-700 rounded w-1/3"></div>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成个人中心骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generatePersonalCenterSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 头部 -->
        <div class="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
        
        <!-- 用户信息 -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="h-24 w-24 bg-gray-700 rounded-full mb-4 md:mb-0"></div>
            <div class="text-center md:text-left">
              <div class="h-8 bg-gray-700 rounded w-1/2 mb-2 mx-auto md:mx-0"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3 mx-auto md:mx-0"></div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            ${Array(4).fill().map(() => `
              <div class="text-center">
                <div class="h-8 bg-gray-700 rounded w-1/2 mx-auto mb-1"></div>
                <div class="h-4 bg-gray-700 rounded w-1/3 mx-auto"></div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 个人设置 -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <div class="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div class="space-y-6">
            ${Array(5).fill().map(() => `
              <div class="flex justify-between items-center border-b border-gray-700 pb-4">
                <div class="h-4 bg-gray-700 rounded w-1/4"></div>
                <div class="h-10 w-24 bg-gray-700 rounded"></div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 投资组合 -->
        <div>
          <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="overflow-hidden rounded-xl border border-gray-700">
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

/**
 * 生成管理员面板骨架屏
 * @returns {string} - 骨架屏HTML
 */
function generateAdminPanelSkeleton() {
  return `
    <div class="container mx-auto px-4 py-6">
      <div class="animate-pulse">
        <!-- 头部 -->
        <div class="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
        
        <!-- 管理统计 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          ${Array(3).fill().map(() => `
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="h-12 bg-gray-700 rounded w-2/3 mb-1"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          `).join('')}
        </div>
        
        <!-- 管理菜单 -->
        <div class="flex flex-wrap gap-4 mb-8">
          ${Array(6).fill().map(() => `
            <div class="h-16 bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex items-center justify-center">
              <div class="h-5 bg-gray-700 rounded w-1/2"></div>
            </div>
          `).join('')}
        </div>
        
        <!-- 最近活动 -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div class="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div class="space-y-6">
            ${Array(5).fill().map(() => `
              <div class="flex gap-4">
                <div class="h-10 w-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div class="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初始化骨架屏系统
 * @returns {SkeletonManager} - 骨架屏管理器实例
 */
export function initSkeletonScreens() {
  const skeletonManager = new SkeletonManager();
  
  // 暴露到全局
  window.skeletonManager = skeletonManager;
  
  // 为页面切换事件添加骨架屏显示逻辑
  if (window.addEventListener) {
    window.addEventListener('pageChange', (event) => {
      if (event.detail && event.detail.pageId) {
        skeletonManager.showSkeleton(event.detail.pageId);
        
        // 模拟数据加载完成后隐藏骨架屏
        setTimeout(() => {
          skeletonManager.hideSkeleton(event.detail.pageId);
        }, 800);
      }
    });
  }
  
  return skeletonManager;
}

/**
 * 显示骨架屏
 * @param {string} pageId - 页面ID
 */
export function showSkeleton(pageId) {
  if (window.skeletonManager) {
    window.skeletonManager.showSkeleton(pageId);
  }
}

/**
 * 隐藏骨架屏
 * @param {string} pageId - 页面ID
 */
export function hideSkeleton(pageId) {
  if (window.skeletonManager) {
    window.skeletonManager.hideSkeleton(pageId);
  }
}

// 默认导出
const skeletonScreens = {
  initSkeletonScreens,
  showSkeleton,
  hideSkeleton
};

export default skeletonScreens;