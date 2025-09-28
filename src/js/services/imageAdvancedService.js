/**
 * 图片高级优化服务
 * 集成现代图片格式支持、响应式加载、智能预加载和渐进式加载等功能
 */
class ImageAdvancedService {
  constructor() {
    // 图片格式支持检测
    this.formatSupport = {
      webp: false,
      avif: false
    };
    
    // 图片质量配置
    this.qualityConfig = {
      low: 30,
      medium: 60,
      high: 80,
      original: 100
    };
    
    // 图片断点配置
    this.breakpoints = {
      mobile: 320,
      tablet: 768,
      desktop: 1200,
      large: 1600
    };
    
    // 图片加载状态缓存
    this.imageCache = new Map();
    
    // 滚动行为分析器
    this.scrollAnalyzer = {
      scrollSpeed: 0,
      lastScrollY: 0,
      direction: 0,
      timestamp: 0
    };
    
    // 预加载队列
    this.preloadQueue = new Set();
    
    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatuses: [408, 429, 500, 502, 503, 504]
    };
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化服务
   */
  init() {
    // 检测浏览器对现代图片格式的支持
    this.detectFormatSupport();
    
    // 设置滚动分析器
    this.setupScrollAnalyzer();
  }
  
  /**
   * 检测浏览器对不同图片格式的支持
   */
  detectFormatSupport() {
    // 检测WebP支持
    this.detectWebPSupport();
    
    // 检测AVIF支持
    this.detectAVIFSupport();
  }
  
  /**
   * 检测WebP支持
   */
  detectWebPSupport() {
    if (!window.Image) {
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      this.formatSupport.webp = img.width === 1 && img.height === 1;
    };
    img.onerror = () => {
      this.formatSupport.webp = false;
    };
    img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  }
  
  /**
   * 检测AVIF支持
   */
  detectAVIFSupport() {
    if (!window.Image) {
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      this.formatSupport.avif = img.width === 1 && img.height === 1;
    };
    img.onerror = () => {
      this.formatSupport.avif = false;
    };
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnF1YWxpdHkAAAAAMWluZm8AAAAOZnJvbSB0b2tlbgAAAA==';
  }
  
  /**
   * 设置滚动行为分析器
   */
  setupScrollAnalyzer() {
    window.addEventListener('scroll', () => {
      const now = Date.now();
      const currentScrollY = window.scrollY;
      
      // 计算滚动速度
      if (this.scrollAnalyzer.timestamp > 0) {
        const timeDiff = now - this.scrollAnalyzer.timestamp;
        const scrollDiff = Math.abs(currentScrollY - this.scrollAnalyzer.lastScrollY);
        this.scrollAnalyzer.scrollSpeed = (scrollDiff / timeDiff) * 1000; // 像素/秒
      }
      
      // 计算滚动方向
      this.scrollAnalyzer.direction = currentScrollY > this.scrollAnalyzer.lastScrollY ? 1 : -1;
      
      // 更新状态
      this.scrollAnalyzer.lastScrollY = currentScrollY;
      this.scrollAnalyzer.timestamp = now;
      
      // 根据滚动行为调整预加载策略
      this.adjustPreloadStrategy();
    });
  }
  
  /**
   * 根据滚动行为调整预加载策略
   */
  adjustPreloadStrategy() {
    // 根据滚动速度动态调整预加载阈值
    // 例如：快速滚动时增大阈值，慢速滚动时减小阈值
    // 这个功能会在智能预加载中使用
  }
  
  /**
   * 获取最佳支持的图片格式
   * @param {Array<string>} formats - 可选的图片格式列表
   * @returns {string} 最佳格式
   */
  getBestSupportedFormat(formats = ['webp', 'avif', 'jpg', 'png']) {
    // 优先选择AVIF
    if (this.formatSupport.avif && formats.includes('avif')) {
      return 'avif';
    }
    
    // 其次选择WebP
    if (this.formatSupport.webp && formats.includes('webp')) {
      return 'webp';
    }
    
    // 默认返回JPEG或列表中的第一个格式
    return formats.includes('jpg') ? 'jpg' : formats[0];
  }
  
  /**
   * 获取响应式图片URL
   * @param {string} src - 原始图片URL
   * @param {Object} options - 选项
   * @returns {string} 优化后的图片URL
   */
  getResponsiveImageUrl(src, options = {}) {
    const { 
      width = 800, 
      quality = 'medium', 
      format = 'auto',
      useCDN = false,
      cdnBaseUrl = 'https://cdn.example.com/images'
    } = options;
    
    // 获取质量值
    const qualityValue = this.qualityConfig[quality] || 80;
    
    // 获取最佳格式
    let targetFormat = format;
    if (format === 'auto') {
      targetFormat = this.getBestSupportedFormat();
    }
    
    // 简单示例：实际项目中应该根据具体的图片服务规则生成URL
    if (useCDN && src.startsWith('/')) {
      // 假设CDN支持查询参数方式调整图片
      const imagePath = src.substring(1); // 移除前导斜杠
      return `${cdnBaseUrl}/${imagePath}?w=${width}&q=${qualityValue}&f=${targetFormat}`;
    }
    
    // 本地图片处理：实际项目中可能需要服务端支持格式转换
    // 这里仅做简单处理，实际优化效果取决于后端支持
    return src;
  }
  
  /**
   * 加载图片并支持重试
   * @param {string} src - 图片URL
   * @param {Object} options - 加载选项
   * @returns {Promise<HTMLImageElement>}
   */
  loadImageWithRetry(src, options = {}) {
    const { 
      retries = 0,
      timeout = 5000,
      crossOrigin = null
    } = options;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId;
      
      // 设置跨域属性
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      
      // 设置加载成功事件
      img.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.imageCache.set(src, true);
        resolve(img);
      };
      
      // 设置加载错误事件
      img.onerror = (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        // 判断是否需要重试
        if (retries < this.retryConfig.maxRetries) {
          console.warn(`图片加载失败，将在${this.retryConfig.retryDelay}ms后重试(${retries + 1}/${this.retryConfig.maxRetries}):`, src);
          
          // 延迟重试
          setTimeout(() => {
            this.loadImageWithRetry(src, { 
              ...options, 
              retries: retries + 1 
            }).then(resolve).catch(reject);
          }, this.retryConfig.retryDelay);
        } else {
          console.error(`图片加载失败，已达到最大重试次数:`, src);
          reject(error);
        }
      };
      
      // 设置超时
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          img.src = ''; // 取消加载
          reject(new Error(`图片加载超时: ${src}`));
        }, timeout);
      }
      
      // 开始加载
      img.src = src;
      
      // 检查是否已在缓存中
      if (img.complete) {
        if (timeoutId) clearTimeout(timeoutId);
        this.imageCache.set(src, true);
        resolve(img);
      }
    });
  }
  
  /**
   * 预加载图片
   * @param {Array<string>} imageUrls - 图片URL列表
   * @param {Object} options - 预加载选项
   * @returns {Promise<Array<{url: string, success: boolean}>>}
   */
  preloadImages(imageUrls, options = {}) {
    const { 
      priority = 'normal', // high, normal, low
      quality = 'low',
      onProgress = null
    } = options;
    
    // 将图片添加到预加载队列
    imageUrls.forEach(url => this.preloadQueue.add(url));
    
    // 并行加载图片
    const loadPromises = imageUrls.map((url, index) => {
      const responsiveUrl = this.getResponsiveImageUrl(url, { quality });
      
      return this.loadImageWithRetry(responsiveUrl)
        .then(() => {
          // 从队列中移除
          this.preloadQueue.delete(url);
          
          // 调用进度回调
          if (onProgress) {
            onProgress({
              index,
              total: imageUrls.length,
              url,
              success: true
            });
          }
          
          return { url, success: true };
        })
        .catch(error => {
          console.error(`预加载图片失败:`, url, error);
          
          // 从队列中移除
          this.preloadQueue.delete(url);
          
          // 调用进度回调
          if (onProgress) {
            onProgress({
              index,
              total: imageUrls.length,
              url,
              success: false,
              error
            });
          }
          
          return { url, success: false, error };
        });
    });
    
    return Promise.all(loadPromises);
  }
  
  /**
   * 智能预加载 - 基于滚动位置和方向
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 预加载选项
   */
  setupSmartPreloading(container, options = {}) {
    const {
      selector = 'img[data-src]',
      threshold = 300, // 预加载区域阈值
      quality = 'low'
    } = options;
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      const preloadUrls = [];
      
      entries.forEach(entry => {
        if (entry.isIntersecting || 
            // 根据滚动方向和速度提前预加载
            (this.scrollAnalyzer.direction === 1 && entry.boundingClientRect.top < window.innerHeight + threshold) ||
            (this.scrollAnalyzer.direction === -1 && entry.boundingClientRect.bottom > -threshold)) {
          
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc && !this.preloadQueue.has(dataSrc)) {
            preloadUrls.push(dataSrc);
          }
        }
      });
      
      // 批量预加载
      if (preloadUrls.length > 0) {
        this.preloadImages(preloadUrls, { 
          quality, 
          priority: this.scrollAnalyzer.scrollSpeed > 500 ? 'high' : 'normal'
        });
      }
    }, {
      rootMargin: `${threshold}px ${threshold}px ${threshold}px ${threshold}px`,
      threshold: 0.1
    });
    
    // 观察所有图片
    const images = container.querySelectorAll(selector);
    images.forEach(img => observer.observe(img));
    
    return observer;
  }
  
  /**
   * 实现图片渐进式加载
   * @param {HTMLImageElement} img - 图片元素
   * @param {Object} options - 选项
   */
  setupProgressiveLoading(img, options = {}) {
    const {
      placeholderQuality = 'low',
      targetQuality = 'high',
      transitionTime = 500
    } = options;
    
    // 获取原始图片URL
    const originalSrc = img.src || img.getAttribute('data-src');
    if (!originalSrc) return;
    
    // 标记为渐进式加载
    img.dataset.progressive = 'true';
    img.classList.add('progressive-loading');
    
    // 生成低质量占位图URL
    const placeholderUrl = this.getResponsiveImageUrl(originalSrc, {
      quality: placeholderQuality
    });
    
    // 生成高质量目标图片URL
    const targetUrl = this.getResponsiveImageUrl(originalSrc, {
      quality: targetQuality
    });
    
    // 先加载低质量占位图
    this.loadImageWithRetry(placeholderUrl)
      .then(() => {
        // 设置占位图
        img.src = placeholderUrl;
        
        // 预加载高质量图片
        return this.loadImageWithRetry(targetUrl);
      })
      .then(() => {
        // 高质量图片加载完成后，平滑过渡
        setTimeout(() => {
          img.src = targetUrl;
          img.classList.add('progressive-loaded');
          
          // 过渡动画完成后移除标记
          setTimeout(() => {
            img.classList.remove('progressive-loading', 'progressive-loaded');
            delete img.dataset.progressive;
          }, transitionTime);
        }, 100); // 给占位图一点显示时间
      })
      .catch(error => {
        console.error(`渐进式加载图片失败:`, originalSrc, error);
      });
  }
  
  /**
   * 为所有符合条件的图片设置渐进式加载
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 选项
   */
  setupProgressiveLoadingForContainer(container, options = {}) {
    const {
      selector = 'img[data-progressive]'
    } = options;
    
    const images = container.querySelectorAll(selector);
    images.forEach(img => {
      this.setupProgressiveLoading(img, options);
    });
  }
  
  /**
   * 获取图片加载统计信息
   * @returns {Object} 统计信息
   */
  getImageStats() {
    return {
      formatSupport: this.formatSupport,
      cachedImages: this.imageCache.size,
      preloadQueueSize: this.preloadQueue.size,
      scrollSpeed: this.scrollAnalyzer.scrollSpeed
    };
  }
}

// 创建单例实例
const imageAdvancedService = new ImageAdvancedService();

// 导出服务和工具函数
export default imageAdvancedService;

export function getBestSupportedImageFormat(formats) {
  return imageAdvancedService.getBestSupportedFormat(formats);
}

export function loadImageWithRetry(src, options) {
  return imageAdvancedService.loadImageWithRetry(src, options);
}

export function preloadImagesWithStrategy(imageUrls, options) {
  return imageAdvancedService.preloadImages(imageUrls, options);
}

export function setupSmartImagePreloading(container, options) {
  return imageAdvancedService.setupSmartPreloading(container, options);
}

export function setupProgressiveImageLoading(img, options) {
  return imageAdvancedService.setupProgressiveLoading(img, options);
}