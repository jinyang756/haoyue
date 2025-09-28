/**
 * 骨架屏功能模块 - 提供页面加载过程中的视觉反馈
 * 作者: AI助手
 * 版本: 1.0
 * 日期: 2023-11-15
 */

/**
 * 显示页面骨架屏
 * @param {string} pageId - 页面ID
 */
export function showSkeleton(pageId) {
  try {
    console.log(`显示骨架屏: ${pageId}`);
    
    // 获取或创建骨架屏容器
    let skeletonContainer = document.getElementById(`skeleton-${pageId}`);
    
    if (!skeletonContainer) {
      // 创建骨架屏容器
      skeletonContainer = document.createElement('div');
      skeletonContainer.id = `skeleton-${pageId}`;
      skeletonContainer.className = 'skeleton-container fixed inset-0 z-40 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm';
      
      // 根据不同页面类型生成不同的骨架屏内容
      const skeletonContent = generateSkeletonContent(pageId);
      skeletonContainer.innerHTML = skeletonContent;
      
      document.body.appendChild(skeletonContainer);
    } else {
      // 如果骨架屏已存在，显示它
      skeletonContainer.classList.remove('hidden');
    }
    
    // 添加淡入动画
    setTimeout(() => {
      skeletonContainer.classList.add('opacity-100');
      skeletonContainer.classList.remove('opacity-0');
    }, 10);
    
  } catch (error) {
    console.error(`显示骨架屏失败: ${pageId}`, error);
  }
}

/**
 * 隐藏页面骨架屏
 * @param {string} pageId - 页面ID
 */
export function hideSkeleton(pageId) {
  try {
    const skeletonContainer = document.getElementById(`skeleton-${pageId}`);
    
    if (skeletonContainer) {
      // 添加淡出动画
      skeletonContainer.classList.add('opacity-0');
      skeletonContainer.classList.remove('opacity-100');
      
      // 动画完成后隐藏骨架屏
      setTimeout(() => {
        skeletonContainer.classList.add('hidden');
      }, 300);
    }
    
  } catch (error) {
    console.error(`隐藏骨架屏失败: ${pageId}`, error);
  }
}

/**
 * 根据页面ID生成骨架屏内容
 * @param {string} pageId - 页面ID
 * @returns {string} - 骨架屏HTML内容
 */
function generateSkeletonContent(pageId) {
  // 默认骨架屏内容
  let skeletonHTML = `
    <div class="skeleton-content w-full max-w-4xl mx-auto p-4">
      <div class="bg-gray-800/60 rounded-xl p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-6 bg-gray-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-700 rounded w-2/3"></div>
          <div class="h-4 bg-gray-700 rounded w-1/2"></div>
          <div class="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  `;
  
  // 根据不同页面类型生成特定的骨架屏
  switch(pageId) {
    case 'home':
      skeletonHTML = generateHomePageSkeleton();
      break;
    case 'market-list':
      skeletonHTML = generateMarketListSkeleton();
      break;
    case 'quant-stock':
      skeletonHTML = generateQuantStockSkeleton();
      break;
    case 'personal-center':
      skeletonHTML = generatePersonalCenterSkeleton();
      break;
    case 'admin-panel':
      skeletonHTML = generateAdminPanelSkeleton();
      break;
    // 其他页面类型可以在这里添加
  }
  
  return skeletonHTML;
}

/**
 * 生成首页骨架屏
 */
function generateHomePageSkeleton() {
  return `
    <div class="skeleton-content w-full max-w-6xl mx-auto p-4">
      <!-- 顶部标题 -->
      <div class="animate-pulse mb-6">
        <div class="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>
      
      <!-- 市场概览卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${Array(4).fill().map(() => `
          <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
            <div class="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
            <div class="h-6 bg-gray-700 rounded w-2/3 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          </div>
        `).join('')}
      </div>
      
      <!-- 主要图表区域 -->
      <div class="bg-gray-800/60 rounded-xl p-4 mb-6 animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div class="h-64 bg-gray-700 rounded mb-4"></div>
        <div class="grid grid-cols-4 gap-2">
          ${Array(4).fill().map(() => `
            <div class="h-4 bg-gray-700 rounded"></div>
          `).join('')}
        </div>
      </div>
      
      <!-- 热门股票列表 -->
      <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div class="space-y-3">
          ${Array(5).fill().map(() => `
            <div class="flex justify-between items-center">
              <div class="h-4 bg-gray-700 rounded w-1/6"></div>
              <div class="h-4 bg-gray-700 rounded w-1/8"></div>
              <div class="h-4 bg-gray-700 rounded w-1/8"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成市场列表骨架屏
 */
function generateMarketListSkeleton() {
  return `
    <div class="skeleton-content w-full max-w-5xl mx-auto p-4">
      <!-- 搜索和筛选 -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-pulse">
        <div class="h-10 bg-gray-700 rounded w-full sm:w-1/3 mb-4 sm:mb-0"></div>
        <div class="flex space-x-2 w-full sm:w-auto">
          <div class="h-10 bg-gray-700 rounded w-1/3 sm:w-24"></div>
          <div class="h-10 bg-gray-700 rounded w-1/3 sm:w-24"></div>
        </div>
      </div>
      
      <!-- 股票列表表格 -->
      <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
        <!-- 表格头部 -->
        <div class="grid grid-cols-4 gap-2 mb-4">
          ${Array(4).fill().map(() => `
            <div class="h-4 bg-gray-700 rounded"></div>
          `).join('')}
        </div>
        
        <!-- 表格内容 -->
        <div class="space-y-4">
          ${Array(10).fill().map(() => `
            <div class="grid grid-cols-4 gap-2 py-3 border-t border-gray-700">
              <div class="h-4 bg-gray-700 rounded"></div>
              <div class="h-4 bg-gray-700 rounded"></div>
              <div class="h-4 bg-gray-700 rounded"></div>
              <div class="h-4 bg-gray-700 rounded"></div>
            </div>
          `).join('')}
        </div>
        
        <!-- 分页 -->
        <div class="flex justify-center mt-6">
          <div class="flex space-x-2">
            ${Array(5).fill().map(() => `
              <div class="h-8 w-8 bg-gray-700 rounded"></div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成量化选股骨架屏
 */
function generateQuantStockSkeleton() {
  return `
    <div class="skeleton-content w-full max-w-5xl mx-auto p-4">
      <!-- 标题和描述 -->
      <div class="animate-pulse mb-6">
        <div class="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
      
      <!-- 参数设置区域 -->
      <div class="bg-gray-800/60 rounded-xl p-4 mb-6 animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div class="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div class="h-10 bg-gray-700 rounded w-full"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div class="h-10 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
        
        <!-- 按钮区域 -->
        <div class="flex justify-center mt-4">
          <div class="h-10 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
      
      <!-- 结果展示区域 -->
      <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        
        <!-- 图表占位 -->
        <div class="h-64 bg-gray-700 rounded mb-4"></div>
        
        <!-- 结果列表 -->
        <div class="space-y-3">
          ${Array(5).fill().map(() => `
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <div class="h-4 bg-gray-700 rounded w-1/6"></div>
              <div class="h-4 bg-gray-700 rounded w-1/8"></div>
              <div class="h-4 bg-gray-700 rounded w-1/8"></div>
              <div class="h-4 bg-gray-700 rounded w-1/8"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成个人中心骨架屏
 */
function generatePersonalCenterSkeleton() {
  return `
    <div class="skeleton-content w-full max-w-4xl mx-auto p-4">
      <!-- 用户信息卡片 -->
      <div class="bg-gray-800/60 rounded-xl p-6 mb-6 animate-pulse">
        <div class="flex items-center mb-4">
          <div class="h-16 w-16 bg-gray-700 rounded-full mr-4"></div>
          <div>
            <div class="h-6 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${Array(3).fill().map(() => `
            <div class="text-center">
              <div class="h-6 bg-gray-700 rounded w-1/2 mx-auto mb-1"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3 mx-auto"></div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 设置项 -->
      <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        
        <div class="space-y-4">
          ${Array(6).fill().map(() => `
            <div class="flex justify-between items-center py-3 border-b border-gray-700">
              <div class="h-4 bg-gray-700 rounded w-1/4"></div>
              <div class="h-8 w-8 bg-gray-700 rounded-full"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 生成管理员面板骨架屏
 */
function generateAdminPanelSkeleton() {
  return `
    <div class="skeleton-content w-full max-w-6xl mx-auto p-4">
      <!-- 标题和统计卡片 -->
      <div class="animate-pulse mb-6">
        <div class="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${Array(3).fill().map(() => `
            <div class="bg-gray-800/60 rounded-xl p-4">
              <div class="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 管理员功能区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 用户管理 -->
        <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
          <div class="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div class="space-y-3">
            ${Array(4).fill().map(() => `
              <div class="flex justify-between items-center py-2 border-b border-gray-700">
                <div class="h-4 bg-gray-700 rounded w-1/4"></div>
                <div class="h-4 bg-gray-700 rounded w-1/5"></div>
                <div class="h-6 bg-gray-700 rounded w-1/6"></div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 系统设置 -->
        <div class="bg-gray-800/60 rounded-xl p-4 animate-pulse">
          <div class="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div class="space-y-4">
            ${Array(5).fill().map(() => `
              <div class="flex justify-between items-center">
                <div class="h-4 bg-gray-700 rounded w-1/3"></div>
                <div class="h-6 w-12 bg-gray-700 rounded"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 初始化骨架屏功能
 */
export function initSkeletonScreens() {
  try {
    // 添加骨架屏基础样式
    const style = document.createElement('style');
    style.textContent = `
      .skeleton-container {
        transition: opacity 0.3s ease-in-out;
      }
      .skeleton-container.opacity-0 {
        opacity: 0;
        pointer-events: none;
      }
      .skeleton-container.opacity-100 {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    console.log('骨架屏功能初始化完成');
  } catch (error) {
    console.error('骨架屏功能初始化失败:', error);
  }
}