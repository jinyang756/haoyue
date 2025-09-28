// 动画工具模块 - 提供各种页面动画效果

/**
 * 打字效果动画
 * @param {HTMLElement} element - 显示打字效果的DOM元素
 * @param {Array} texts - 要显示的文本数组
 * @param {number} typingSpeed - 打字速度（毫秒）
 * @param {number} deletingSpeed - 删除速度（毫秒）
 * @param {number} delayBetweenTexts - 文本之间的延迟（毫秒）
 */
export function typingEffect(element, texts = ['量化智能引擎', '投资决策系统', '智能选股工具'], typingSpeed = 80, deletingSpeed = 50, delayBetweenTexts = 1000) {
  if (!element) return;
  
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      // 删除文字
      element.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // 打字效果
      element.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }
    
    // 计算当前打字速度
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    
    // 判断是否需要切换状态或文本
    if (!isDeleting && charIndex === currentText.length) {
      // 完成当前文本的打字，准备删除
      isDeleting = true;
      setTimeout(type, delayBetweenTexts);
    } else if (isDeleting && charIndex === 0) {
      // 完成删除，准备打下一个文本
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      setTimeout(type, 500);
    } else {
      // 继续打字或删除
      setTimeout(type, speed);
    }
  }
  
  // 开始打字效果
  type();
}

/**
 * 滚动渐入动画
 * 当元素滚动到视口可见区域时，添加淡入效果
 */
export function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  
  function checkVisibility() {
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // 当元素进入视口时，添加动画类
      if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
        element.classList.add('fade-in');
      }
    });
  }
  
  // 初始检查
  checkVisibility();
  
  // 监听滚动事件
  window.addEventListener('scroll', checkVisibility);
  
  // 提供清理方法
  return {
    cleanup: () => {
      window.removeEventListener('scroll', checkVisibility);
    }
  };
}

/**
 * 鼠标跟随效果
 * 创建粒子跟随鼠标移动
 * @param {HTMLElement} container - 粒子容器
 */
export function initMouseFollowEffect(container) {
  if (!container) return;
  
  // 性能优化：检测设备性能，在低性能设备上禁用效果
  const isLowPerformance = navigator.hardwareConcurrency <= 2 || window.innerWidth < 768;
  if (isLowPerformance) {
    console.log('性能模式：已禁用鼠标跟随效果');
    return {
      cleanup: () => {}
    };
  }
  
  let particles = [];
  // 性能优化：减少粒子数量
  const particleCount = 10;
  let mouseX = 0;
  let mouseY = 0;
  let animationId = null;
  let lastMouseMove = Date.now();
  const updateInterval = 16; // 约60fps
  
  // 创建粒子
  function createParticles() {
    // 清空现有粒子
    container.innerHTML = '';
    particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      
      // 随机样式
      const size = Math.random() * 4 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.7 + 0.3})`;
      particle.style.borderRadius = '50%';
      particle.style.position = 'absolute';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      
      // 添加到容器
      container.appendChild(particle);
      
      // 记录粒子信息
      particles.push({
        element: particle,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        speed: Math.random() * 0.1 + 0.05, // 稍微增加速度以保持流畅感
        size: size,
        delay: i * 0.05 // 错开每个粒子的移动时间
      });
    }
  }
  
  // 更新粒子位置 - 性能优化版
  function updateParticles() {
    // 性能优化：只有当鼠标移动时才更新粒子
    const now = Date.now();
    if (now - lastMouseMove < 1000) { // 鼠标1秒内有移动才更新
      particles.forEach((particle, index) => {
        // 计算目标位置（根据粒子索引产生偏移）
        const angle = (index * 45) * (Math.PI / 180);
        const distance = index * 8; // 减少距离以减少移动范围
        
        particle.targetX = mouseX + Math.cos(angle) * distance;
        particle.targetY = mouseY + Math.sin(angle) * distance;
        
        // 使用缓动函数使移动更平滑
        particle.x += (particle.targetX - particle.x) * particle.speed;
        particle.y += (particle.targetY - particle.y) * particle.speed;
        
        // 更新DOM位置
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      });
    }
    
    animationId = requestAnimationFrame(updateParticles);
  }
  
  // 鼠标移动事件处理
  function handleMouseMove(e) {
    const now = Date.now();
    // 性能优化：限制鼠标移动事件处理频率
    if (now - lastMouseMove > updateInterval) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseMove = now;
    }
  }
  
  // 初始化
  createParticles();
  updateParticles();
  
  // 添加鼠标事件监听
  document.addEventListener('mousemove', handleMouseMove);
  
  // 窗口大小变化时重新创建粒子
  window.addEventListener('resize', createParticles);
  
  // 提供清理方法
  return {
    cleanup: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', createParticles);
      container.innerHTML = '';
    }
  };
}

/**
 * 创建加载动画
 * @param {HTMLElement} container - 加载动画容器
 * @returns {Object} - 包含开始和停止方法的对象
 */
export function createLoadingAnimation(container) {
  if (!container) return;
  
  // 创建加载指示器
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.innerHTML = `
    <div class="spinner-circle"></div>
    <div class="spinner-text">加载中...</div>
  `;
  
  container.appendChild(spinner);
  
  return {
    start: () => {
      container.classList.remove('hidden');
      spinner.classList.add('spinning');
    },
    stop: () => {
      container.classList.add('hidden');
      spinner.classList.remove('spinning');
    }
  };
}

/**
 * 淡入动画
 * @param {HTMLElement} element - 要淡入的元素
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {Function} callback - 动画完成后的回调函数
 */
export function fadeIn(element, duration = 500, callback = null) {
  if (!element) return;
  
  // 确保元素是可见的
  element.style.display = 'block';
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-out`;
  
  // 触发重绘
  element.offsetHeight;
  
  // 开始淡入
  element.style.opacity = '1';
  
  // 动画完成后的回调
  if (callback && typeof callback === 'function') {
    setTimeout(callback, duration);
  }
}

/**
 * 淡出动画
 * @param {HTMLElement} element - 要淡出的元素
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {Function} callback - 动画完成后的回调函数
 */
export function fadeOut(element, duration = 500, callback = null) {
  if (!element) return;
  
  element.style.opacity = '1';
  element.style.transition = `opacity ${duration}ms ease-out`;
  
  // 触发重绘
  element.offsetHeight;
  
  // 开始淡出
  element.style.opacity = '0';
  
  // 动画完成后的回调
  if (callback && typeof callback === 'function') {
    setTimeout(() => {
      element.style.display = 'none';
      callback();
    }, duration);
  }
}

/**
 * 数字滚动动画
 * @param {HTMLElement} element - 显示数字的元素
 * @param {number} start - 起始数字
 * @param {number} end - 结束数字
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {Object} options - 配置选项
 */
export function animateNumber(element, start = 0, end = 100, duration = 2000, options = {}) {
  if (!element) return;
  
  const { 
    decimalPlaces = 0, 
    prefix = '', 
    suffix = '',
    easing = 'easeOutQuad'
  } = options;
  
  let startTime = null;
  
  // 缓动函数
  const easingFunctions = {
    easeOutQuad: (t) => t * (2 - t),
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };
  
  const easingFn = easingFunctions[easing] || easingFunctions.easeOutQuad;
  
  function updateNumber(timestamp) {
    if (!startTime) startTime = timestamp;
    
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = easingFn(progress);
    const currentValue = start + (end - start) * easedProgress;
    
    // 格式化数字
    const formattedValue = currentValue.toFixed(decimalPlaces);
    element.textContent = `${prefix}${formattedValue}${suffix}`;
    
    // 继续动画
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  // 开始动画
  requestAnimationFrame(updateNumber);
}