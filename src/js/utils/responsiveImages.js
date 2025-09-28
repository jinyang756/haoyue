/**
 * 响应式图片优化工具
 * 提供图片CDN服务集成、响应式图片加载、自适应图像优化等功能
 */
class ResponsiveImages {
  constructor() {
    // 多CDN配置，支持故障转移
    this.cdns = [
      { baseUrl: 'https://cdn.example.com/images', priority: 1, weight: 0.8 },
      { baseUrl: 'https://fallback-cdn.example.com/images', priority: 2, weight: 0.2 }
    ];
    this.currentCdnIndex = 0;
    this.cdnHealth = new Map();
    this.supportedFormats = ['webp', 'avif', 'jpg', 'png'];
    this.defaultQuality = 80;
    this.breakpoints = {
      mobile: 320,
      tablet: 768,
      desktop: 1200,
      large: 1600,
      xlarge: 1920
    };
    this.observers = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.init();
  }

  /**
   * 初始化响应式图片系统
   */
  init() {
    // 检测浏览器对不同图片格式的支持
    this.detectFormatSupport();
    
    // 初始化CDN健康检查
    this.initCdnHealthCheck();
    
    // 监听窗口大小变化，更新图片
    window.addEventListener('resize', this.debounce(() => {
      this.updateResponsiveImages();
    }, 300));
    
    // 初始化所有响应式图片
    document.addEventListener('DOMContentLoaded', () => {
      this.initResponsiveImages();
    });
  }

  /**
   * 初始化CDN健康检查
   */
  initCdnHealthCheck() {
    // 初始化所有CDN为健康状态
    this.cdns.forEach((cdn, index) => {
      this.cdnHealth.set(cdn.baseUrl, true);
    });
    
    // 定期检查CDN健康状态
    setInterval(() => {
      this.checkCdnHealth();
    }, 60000); // 每分钟检查一次
  }

  /**
   * 检查CDN健康状态
   */
  checkCdnHealth() {
    this.cdns.forEach((cdn, index) => {
      const testUrl = `${cdn.baseUrl}/health-check.png?timestamp=${Date.now()}`;
      
      fetch(testUrl, { method: 'HEAD', cache: 'no-cache' })
        .then(response => {
          this.cdnHealth.set(cdn.baseUrl, response.ok);
          if (response.ok && !this.cdnHealth.get(this.cdns[this.currentCdnIndex].baseUrl)) {
            // 如果当前使用的CDN不健康，但其他CDN健康，则切换
            this.switchToHealthyCdn();
          }
        })
        .catch(() => {
          this.cdnHealth.set(cdn.baseUrl, false);
          if (index === this.currentCdnIndex) {
            // 如果当前使用的CDN不健康，则尝试切换
            this.switchToHealthyCdn();
          }
        });
    });
  }

  /**
   * 切换到健康的CDN
   */
  switchToHealthyCdn() {
    for (let i = 0; i < this.cdns.length; i++) {
      const cdn = this.cdns[i];
      if (this.cdnHealth.get(cdn.baseUrl)) {
        this.currentCdnIndex = i;
        console.log(`Switched to CDN: ${cdn.baseUrl}`);
        return;
      }
    }
    // 如果没有健康的CDN，继续使用当前CDN
    console.warn('No healthy CDN available, continuing with current CDN');
  }

  /**
   * 获取当前活动的CDN基础URL
   * 支持负载均衡策略
   */
  getCurrentCdnBaseUrl() {
    // 简单的加权轮询策略
    const healthyCdns = this.cdns.filter(cdn => this.cdnHealth.get(cdn.baseUrl));
    
    if (healthyCdns.length === 0) {
      return this.cdns[this.currentCdnIndex].baseUrl;
    }
    
    // 如果只有一个健康的CDN，直接返回
    if (healthyCdns.length === 1) {
      return healthyCdns[0].baseUrl;
    }
    
    // 根据权重随机选择CDN
    const totalWeight = healthyCdns.reduce((sum, cdn) => sum + cdn.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const cdn of healthyCdns) {
      random -= cdn.weight;
      if (random <= 0) {
        return cdn.baseUrl;
      }
    }
    
    return healthyCdns[0].baseUrl;
  }

  /**
   * 检测浏览器对不同图片格式的支持
   */
  detectFormatSupport() {
    this.formatSupport = {
      webp: false,
      avif: false
    };

    // 检测WebP支持
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = () => {
      this.formatSupport.webp = webpTest.height === 2;
    };
    webpTest.src = 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==';

    // 检测AVIF支持
    const avifTest = new Image();
    avifTest.onload = avifTest.onerror = () => {
      this.formatSupport.avif = avifTest.height === 2;
    };
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnF1YWxpdHkAAAAAMWluZm8AAAAOZnJvbSB0b2tlbgAAAA==';
  }

  /**
   * 初始化所有响应式图片
   */
  initResponsiveImages() {
    const responsiveImages = document.querySelectorAll('img[data-src], img[data-responsive]');
    
    responsiveImages.forEach(img => {
      this.processResponsiveImage(img);
      this.observeImage(img);
    });
  }

  /**
   * 处理单个响应式图片
   * @param {HTMLImageElement} img - 图片元素
   */
  processResponsiveImage(img) {
    if (!img.dataset.src) return;

    const src = img.dataset.src;
    const width = this.getImageWidth(img);
    const quality = img.dataset.quality || this.defaultQuality;
    const format = this.getBestSupportedFormat(img.dataset.formats);
    
    // 解析图片选项
    const options = this.parseImageOptions(img);

    // 构建响应式图片URL
    const responsiveUrl = this.buildResponsiveUrl(src, width, quality, format, options);

    // 设置图片源
    this.loadImage(img, responsiveUrl);
  }

  /**
   * 解析图片选项
   * @param {HTMLImageElement} img - 图片元素
   * @returns {Object} 解析后的选项
   */
  parseImageOptions(img) {
    const options = {};
    
    // 解析裁剪选项
    if (img.dataset.crop) {
      try {
        const crop = JSON.parse(img.dataset.crop);
        if (crop.width && crop.height) {
          options.crop = crop;
        }
      } catch (e) {
        console.warn('Invalid crop data:', img.dataset.crop);
      }
    }
    
    // 解析焦点选项
    if (img.dataset.focus) {
      options.focus = img.dataset.focus;
    }
    
    // 解析模糊选项
    if (img.dataset.blur) {
      const blur = parseInt(img.dataset.blur);
      if (!isNaN(blur)) {
        options.blur = blur;
      }
    }
    
    // 解析亮度选项
    if (img.dataset.brightness) {
      const brightness = parseInt(img.dataset.brightness);
      if (!isNaN(brightness) && brightness >= 0 && brightness <= 200) {
        options.brightness = brightness;
      }
    }
    
    // 检测网络状态并调整图片质量
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      // 根据网络类型调整默认质量
      if (connection.effectiveType) {
        if (connection.effectiveType.includes('2g')) {
          // 2G网络下降低图片质量
          options.lowQualityFallback = true;
        }
        
        // 启用节省数据模式时降低图片质量
        if (connection.saveData) {
          options.lowQualityFallback = true;
        }
      }
    }
    
    return options;
  }

  /**
   * 获取图片的最佳显示宽度
   * @param {HTMLImageElement} img - 图片元素
   * @returns {number} 图片宽度
   */
  getImageWidth(img) {
    // 获取图片容器的宽度
    let containerWidth = img.parentElement.clientWidth;
    
    // 如果图片有明确的宽度设置，优先使用
    if (img.width) {
      containerWidth = Math.min(containerWidth, img.width);
    }
    
    // 考虑设备像素比以支持高分辨率屏幕
    const dpr = window.devicePixelRatio || 1;
    
    // 根据设备性能和网络状况调整DPR
    let adjustedDpr = dpr;
    
    // 检测网络状态
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      // 2G网络下降低DPR
      if (connection.effectiveType && connection.effectiveType.includes('2g')) {
        adjustedDpr = Math.min(dpr, 1.0);
      }
      // 3G网络下适度降低DPR
      else if (connection.effectiveType && connection.effectiveType.includes('3g')) {
        adjustedDpr = Math.min(dpr, 1.5);
      }
      
      // 启用节省数据模式时降低DPR
      if (connection.saveData) {
        adjustedDpr = 1.0;
      }
    }
    
    // 获取最近的断点
    const width = Math.min(containerWidth, this.getNearestBreakpoint(containerWidth));
    
    // 确保最小宽度
    const minWidth = img.dataset.minWidth ? parseInt(img.dataset.minWidth) : 100;
    
    return Math.floor(Math.max(width * adjustedDpr, minWidth));
  }

  /**
   * 为图片添加渐进式加载效果
   * @param {HTMLImageElement} img - 图片元素
   */
  addProgressiveLoading(img) {
    // 检查是否已经添加了渐进式加载效果
    if (img.classList.contains('progressive-loading')) {
      return;
    }
    
    img.classList.add('progressive-loading');
    
    // 创建低质量预览图
    if (img.dataset.lowQualitySrc) {
      const previewImg = new Image();
      previewImg.src = img.dataset.lowQualitySrc;
      
      previewImg.onload = () => {
        // 为预览图添加模糊效果
        img.style.backgroundImage = `url(${img.dataset.lowQualitySrc})`;
        img.style.backgroundSize = 'cover';
      };
    }
    
    // 监听图片加载完成事件，移除预览图
    img.addEventListener('responsive-image-loaded', () => {
      // 添加淡入动画
      img.style.opacity = '0';
      
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.backgroundImage = 'none';
        img.classList.remove('progressive-loading');
      }, 50);
    });
  }

  /**
   * 获取最近的断点
   * @param {number} width - 当前宽度
   * @returns {number} 最近的断点值
   */
  getNearestBreakpoint(width) {
    const breakpoints = Object.values(this.breakpoints).sort((a, b) => a - b);
    
    for (let i = 0; i < breakpoints.length; i++) {
      if (width <= breakpoints[i]) {
        return breakpoints[i];
      }
    }
    
    return breakpoints[breakpoints.length - 1];
  }

  /**
   * 获取最佳支持的图片格式
   * @param {string} formats - 图片支持的格式列表
   * @returns {string} 最佳格式
   */
  getBestSupportedFormat(formats) {
    const formatList = formats ? formats.split(',').map(f => f.trim()) : this.supportedFormats;
    
    // 优先选择AVIF
    if (this.formatSupport.avif && formatList.includes('avif')) {
      return 'avif';
    }
    
    // 其次选择WebP
    if (this.formatSupport.webp && formatList.includes('webp')) {
      return 'webp';
    }
    
    // 默认返回JPEG
    return formatList.includes('jpg') ? 'jpg' : formatList[0];
  }

  /**
   * 构建响应式图片URL
   * @param {string} src - 原始图片URL
   * @param {number} width - 图片宽度
   * @param {number} quality - 图片质量
   * @param {string} format - 图片格式
   * @param {Object} options - 可选配置
   * @returns {string} 构建的URL
   */
  buildResponsiveUrl(src, width, quality, format, options = {}) {
    // 如果是绝对URL，直接返回
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // 移除扩展名
    const baseName = src.split('.').slice(0, -1).join('.');
    const originalExt = src.split('.').pop();
    
    // 获取当前活动的CDN基础URL
    const cdnBaseUrl = this.getCurrentCdnBaseUrl();
    
    // 构建查询参数
    const params = new URLSearchParams();
    params.append('w', width.toString());
    params.append('q', quality.toString());
    params.append('format', format);
    
    // 添加可选参数
    if (options.crop && options.crop.width && options.crop.height) {
      params.append('crop', `${options.crop.width},${options.crop.height}`);
    }
    
    if (options.focus) {
      params.append('focus', options.focus);
    }
    
    if (options.blur) {
      params.append('blur', options.blur.toString());
    }
    
    if (options.brightness) {
      params.append('brightness', options.brightness.toString());
    }
    
    // 添加时间戳以防止某些缓存问题
    if (options.noCache) {
      params.append('t', Date.now().toString());
    }
    
    // 构建CDN URL
    return `${cdnBaseUrl}/${baseName}?${params.toString()}`;
  }

  /**
   * 加载图片
   * @param {HTMLImageElement} img - 图片元素
   * @param {string} url - 图片URL
   * @param {number} retryCount - 当前重试次数
   */
  loadImage(img, url, retryCount = 0) {
    const tempImg = new Image();
    
    // 设置图片加载超时
    const timeout = setTimeout(() => {
      if (tempImg.complete !== true) {
        console.warn(`Image loading timeout: ${url}`);
        this.handleImageLoadError(img, url, retryCount + 1);
      }
    }, 10000); // 10秒超时
    
    tempImg.onload = () => {
      clearTimeout(timeout);
      
      // 添加图片加载性能数据
      if ('performance' in window && 'getEntriesByName' in window.performance) {
        const perfEntries = performance.getEntriesByName(url);
        if (perfEntries.length > 0) {
          const entry = perfEntries[0];
          img.dataset.loadTime = (entry.responseEnd - entry.startTime).toFixed(2);
        }
      }
      
      img.src = url;
      
      // 移除data-src属性以避免重复加载
      if (img.dataset.src) {
        delete img.dataset.src;
      }
      
      // 添加加载完成的视觉反馈
      img.classList.add('image-loaded');
      
      // 触发加载完成事件
      img.dispatchEvent(new Event('responsive-image-loaded'));
    };
    
    tempImg.onerror = () => {
      clearTimeout(timeout);
      this.handleImageLoadError(img, url, retryCount + 1);
    };
    
    tempImg.src = url;
  }

  /**
   * 处理图片加载错误
   * @param {HTMLImageElement} img - 图片元素
   * @param {string} url - 图片URL
   * @param {number} retryCount - 当前重试次数
   */
  handleImageLoadError(img, url, retryCount) {
    console.warn(`Failed to load responsive image (attempt ${retryCount}): ${url}`);
    
    // 尝试重试加载
    if (retryCount <= this.retryAttempts) {
      // 切换CDN并重试
      this.switchToNextCdn();
      
      // 计算指数退避延迟
      const delay = Math.min(this.retryDelay * Math.pow(2, retryCount - 1), 5000);
      
      setTimeout(() => {
        // 构建新的URL，使用不同的CDN
        const src = img.dataset.src;
        if (src) {
          const width = this.getImageWidth(img);
          const quality = img.dataset.quality || this.defaultQuality;
          const format = this.getBestSupportedFormat(img.dataset.formats);
          const options = { noCache: true };
          
          // 如果已经重试多次，考虑降低质量或使用更兼容的格式
          if (retryCount > 1) {
            options.lowQualityFallback = true;
          }
          
          const newUrl = this.buildResponsiveUrl(src, width, quality, format, options);
          this.loadImage(img, newUrl, retryCount);
        }
      }, delay);
      
      return;
    }
    
    // 所有重试都失败，尝试回退到原始图片或占位图
    if (img.dataset.fallbackSrc) {
      img.src = img.dataset.fallbackSrc;
    } else {
      // 使用内联SVG作为占位图
      const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${this.getImageWidth(img)}' height='${Math.floor(this.getImageWidth(img) * 0.75)}' viewBox='0 0 100 75'%3E%3Crect width='100' height='75' fill='%23f0f0f0'/%3E%3Ctext x='50' y='40' font-family='Arial' font-size='8' text-anchor='middle' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E`;
      img.src = placeholderSvg;
      img.alt = img.alt || 'Image not available';
    }
    
    // 标记图片加载失败
    img.classList.add('image-load-error');
    
    // 触发加载失败事件
    img.dispatchEvent(new Event('responsive-image-error'));
  }

  /**
   * 切换到下一个CDN
   */
  switchToNextCdn() {
    this.currentCdnIndex = (this.currentCdnIndex + 1) % this.cdns.length;
    console.log(`Switched to CDN: ${this.cdns[this.currentCdnIndex].baseUrl}`);
  }

  /**
   * 观察图片元素，当进入视口时加载
   * @param {HTMLImageElement} img - 图片元素
   */
  observeImage(img) {
    // 添加渐进式加载效果
    this.addProgressiveLoading(img);
    
    if (!('IntersectionObserver' in window)) {
      // 不支持IntersectionObserver，直接加载
      this.processResponsiveImage(img);
      return;
    }
    
    // 确定图片的优先级
    const priority = this.determineImagePriority(img);
    
    // 根据优先级使用不同的观察器配置
    let observerKey = `imageObserver-${priority}`;
    let observer = this.observers.get(observerKey);
    
    // 根据优先级设置不同的配置
    const observerOptions = this.getObserverOptionsByPriority(priority);
    
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.processResponsiveImage(img);
            observer.unobserve(img);
          }
        });
      }, observerOptions);
      
      this.observers.set(observerKey, observer);
    }
    
    observer.observe(img);
  }

  /**
   * 确定图片的优先级
   * @param {HTMLImageElement} img - 图片元素
   * @returns {string} 优先级 ('high', 'medium', 'low')
   */
  determineImagePriority(img) {
    // 检查data-priority属性
    if (img.dataset.priority) {
      return img.dataset.priority;
    }
    
    // 根据图片位置确定优先级
    const rect = img.getBoundingClientRect();
    
    // 视口内的图片优先级高
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      return 'high';
    }
    
    // 视口下方1000px内的图片优先级中
    if (rect.top < window.innerHeight + 1000) {
      return 'medium';
    }
    
    // 其他图片优先级低
    return 'low';
  }

  /**
   * 根据优先级获取观察器配置
   * @param {string} priority - 优先级
   * @returns {Object} 观察器配置
   */
  getObserverOptionsByPriority(priority) {
    const configs = {
      high: {
        rootMargin: '200px 0px',
        threshold: 0.05
      },
      medium: {
        rootMargin: '500px 0px',
        threshold: 0.1
      },
      low: {
        rootMargin: '1000px 0px',
        threshold: 0.1
      }
    };
    
    return configs[priority] || configs.medium;
  }

  /**
   * 更新所有响应式图片
   */
  updateResponsiveImages() {
    const responsiveImages = document.querySelectorAll('img[data-responsive]');
    
    responsiveImages.forEach(img => {
      this.processResponsiveImage(img);
    });
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 创建并导出响应式图片管理器实例
export const responsiveImagesManager = new ResponsiveImages();
export default ResponsiveImages;