// 黑洞入口和粒子特效模块

/**
 * 初始化黑洞入口界面
 */
export function initBlackholeEntry() {
  // 直接获取DOM元素，不需要等待DOMContentLoaded（ES模块加载完成时DOM已经准备就绪）
  const blackholeEntry = document.getElementById('blackhole-entry');
  const loadingProgress = document.getElementById('loading-progress');
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  
  // 隐藏粒子容器
  const particlesContainer = document.getElementById('particles-container');
  if (particlesContainer) {
    particlesContainer.style.display = 'none';
  }
  
  // 快速完成加载动画
  let progress = 0;
  const maxRetries = 10; // 设置最大重试次数，防止无限循环
  let retryCount = 0;
  
  const progressInterval = setInterval(() => {
    retryCount++;
    
    // 快速递增进度
    progress += 20;
    if (progress >= 100 || retryCount >= maxRetries) {
      progress = 100;
      clearInterval(progressInterval);
      
      // 加载完成后快速进入主页面
      setTimeout(() => {
        if (blackholeEntry) {
          blackholeEntry.style.opacity = '0';
          blackholeEntry.style.transition = 'opacity 0.5s ease';
          
          setTimeout(() => {
            blackholeEntry.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 确保进入首页，提供更健壮的处理
            try {
              // 优先使用window.navigateTo
              if (typeof window.navigateTo === 'function') {
                window.navigateTo('home');
              } else {
                // 备用方案：直接显示首页内容
                const homePage = document.getElementById('home-page');
                if (homePage) {
                  homePage.classList.remove('hidden');
                  // 手动初始化首页内容
                  if (typeof window.initHomePage === 'function') {
                    window.initHomePage();
                  }
                }
              }
            } catch (error) {
              console.error('导航到首页时出错:', error);
              // 最后的备用方案：显示首页内容
              const homePage = document.getElementById('home-page');
              if (homePage) {
                homePage.classList.remove('hidden');
              }
            }
          }, 500);
        }
      }, 300);
    }
    
    // 更新进度条
    if (progressBar && progressPercent) {
      progressBar.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;
    }
  }, 200); // 快速更新进度
}