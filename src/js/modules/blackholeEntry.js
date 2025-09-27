// 黑洞入口和粒子特效模块

/**
 * 初始化黑洞入口界面和粒子特效
 */
export function initBlackholeEntry() {
  document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const blackholeEntry = document.getElementById('blackhole-entry');
    const particlesContainer = document.getElementById('particles-container');
    const loadingProgress = document.getElementById('loading-progress');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    const progressPercent = document.getElementById('progress-percent');
    
    // 粒子数量
    const particleCount = 300;
    
    // 创建粒子
    function createParticles() {
      if (particlesContainer) {
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          
          // 随机大小
          const size = Math.random() * 2 + 1;
          
          // 随机位置
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          
          // 随机颜色 - 主要使用蓝色和白色
          const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#FFFFFF'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          // 随机动画延迟
          const delay = Math.random() * 3;
          
          // 设置粒子样式
          particle.style.position = 'absolute';
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.backgroundColor = color;
          particle.style.borderRadius = '50%';
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.opacity = '0';
          particle.style.transition = `all ${Math.random() * 8 + 5}s ease ${delay}s`;
          
          particlesContainer.appendChild(particle);
        }
      }
    }
    
    // 初始化粒子
    createParticles();
    
    // 自动开始粒子特效
    setTimeout(() => {
      if (particlesContainer) {
        // 激活粒子动画
        const particles = particlesContainer.querySelectorAll('div');
        particles.forEach(particle => {
          // 随机目标位置（围绕中心）
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 30 + 20;
          const targetX = 50 + Math.cos(angle) * distance;
          const targetY = 50 + Math.sin(angle) * distance;
          
          // 随机动画持续时间 - 更慢
          const duration = Math.random() * 5 + 4;
          
          // 设置粒子动画
          particle.style.transition = `all ${duration}s ease-in-out`;
          particle.style.opacity = '1';
          particle.style.left = `${targetX}%`;
          particle.style.top = `${targetY}%`;
          
          // 粒子到达目标位置后开始向中心汇聚 - 更慢
          setTimeout(() => {
            particle.style.transition = `all ${Math.random() * 4 + 5}s ease-in-out`;
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0.5)';
          }, duration * 1000);
        });
      }
      
      // 显示加载进度
      setTimeout(() => {
        // 模拟加载进度
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // 加载完成后显示皓月光辉效果
            setTimeout(() => {
              if (blackholeEntry) {
                const centerGlow = document.createElement('div');
                centerGlow.style.position = 'absolute';
                centerGlow.style.width = '200px';
                centerGlow.style.height = '200px';
                centerGlow.style.borderRadius = '50%';
                centerGlow.style.left = '50%';
                centerGlow.style.top = '50%';
                centerGlow.style.transform = 'translate(-50%, -50%)';
                centerGlow.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                centerGlow.style.boxShadow = '0 0 50px 20px rgba(255, 255, 255, 0.5)';
                centerGlow.style.opacity = '0';
                centerGlow.style.transition = 'opacity 1s ease';
                blackholeEntry.appendChild(centerGlow);
                
                // 显示白光效果
                setTimeout(() => {
                  centerGlow.style.opacity = '1';
                  
                  // 白光效果后进入主页面
                  setTimeout(() => {
                    blackholeEntry.style.opacity = '0';
                    blackholeEntry.style.transition = 'opacity 1s ease';
                    
                    setTimeout(() => {
                      blackholeEntry.style.display = 'none';
                      document.body.style.overflow = 'auto';
                      
                      // 进入首页
                      const navigateTo = window.navigateTo || function() {
                        document.getElementById('home-page').classList.remove('hidden');
                      };
                      navigateTo('home');
                    }, 1000);
                  }, 500);
                }, 500);
              }
            }, 500);
          }
          
          if (progressBar && progressPercent) {
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.floor(progress)}%`;
          }
        }, 300);
      }, 2000);
    }, 500);
  });
}