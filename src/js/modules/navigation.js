// 页面导航功能模块

/**
 * 导航到指定页面
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
  
  // 隐藏所有页面
  document.querySelectorAll('.page-section').forEach(page => {
    page.classList.add('hidden');
  });
  
  // 显示目标页面
  document.getElementById(`${pageId}-page`).classList.remove('hidden');
  
  // 更新底部导航栏状态
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });
}

/**
 * 检查管理员是否已登录
 * @returns {boolean} - 登录状态
 */
export function isAdminLoggedIn() {
  // 这里可以根据实际情况实现登录状态检查
  // 目前简单模拟，假设管理员页面显示即为已登录
  return !document.getElementById('admin-panel-page').classList.contains('hidden');
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