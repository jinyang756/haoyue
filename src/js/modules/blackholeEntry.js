// 黑洞入口和粒子特效模块

/**
 * 初始化黑洞入口界面（静态版本）
 */
export function initBlackholeEntry() {
  document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const blackholeEntry = document.getElementById('blackhole-entry');
    const loadingProgress = document.getElementById('loading-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    
    // 隐藏粒子容器（不需要动态粒子效果）
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
      particlesContainer.style.display = 'none';
    }
    
    // 简化的加载进度模拟
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20; // 快速递增进度
      if (progress >= 100) {
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
              
              // 进入首页
              const navigateTo = window.navigateTo || function() {
                document.getElementById('home-page').classList.remove('hidden');
              };
              navigateTo('home');
            }, 500);
          }
        }, 300);
      }
      
      if (progressBar && progressPercent) {
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
      }
    }, 200); // 更短的更新间隔，快速完成加载
  });
}