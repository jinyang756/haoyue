/**
 * 图片优化工具类
 * 实现响应式图片加载、WebP支持检测和图片预加载等功能
 */
class ImageOptimizer {
  constructor() {
    // 检测浏览器对WebP的支持
    this.webpSupported = false;
    this.detectWebPSupport();
    
    // 图片加载状态缓存
    this.loadedImages = new Map();
    
    // 图片质量配置
    this.qualityConfig = {
      low: 30,
      medium: 60,
      high: 80,
      original: 100
    };
    
    // 初始化时尝试预加载一些关键图片
    this.preloadCriticalImages();
  }
  
  /**
   * 检测浏览器是否支持WebP格式
   */
  detectWebPSupport() {
    if (!window.Image) {
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      this.webpSupported = img.width === 1 && img.height === 1;
    };
    img.onerror = () => {
      this.webpSupported = false;
    };
    img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  }
  
  /**
   * 获取图片的响应式URL
   * @param {string} baseUrl - 图片基础URL
   * @param {object} options - 配置选项
   * @returns {string} - 优化后的图片URL
   */
  getResponsiveImageUrl(baseUrl, options = {}) {
    const { width = 800, quality = 'medium', format = 'auto' } = options;
    
    // 如果没有设置基础URL，则返回占位图
    if (!baseUrl) {
      return this.getPlaceholderImageUrl(width);
    }
    
    // 确定最终格式
    let finalFormat = format;
    if (format === 'auto') {
      finalFormat = this.webpSupported ? 'webp' : 'jpg';
    }
    
    // 获取质量值
    const qualityValue = typeof quality === 'number' ? quality : this.qualityConfig[quality] || this.qualityConfig.medium;
    
    // 构建优化后的URL
    // 这里假设我们有一个图片处理服务，可以处理不同格式和尺寸的图片
    // 实际项目中，这可能需要根据后端API的具体实现进行调整
    const optimizedUrl = this.buildOptimizedUrl(baseUrl, { width, quality: qualityValue, format: finalFormat });
    
    return optimizedUrl;
  }
  
  /**
   * 构建优化后的图片URL
   * @param {string} baseUrl - 图片基础URL
   * @param {object} params - 优化参数
   * @returns {string} - 优化后的图片URL
   */
  buildOptimizedUrl(baseUrl, params) {
    // 检查是否已经是处理过的URL
    if (baseUrl.includes('?')) {
      // 已经包含查询参数，直接添加新参数
      return `${baseUrl}&w=${params.width}&q=${params.quality}&fm=${params.format}`;
    } else {
      // 添加查询参数
      return `${baseUrl}?w=${params.width}&q=${params.quality}&fm=${params.format}`;
    }
  }
  
  /**
   * 获取占位图URL
   * @param {number} width - 占位图宽度
   * @returns {string} - 占位图URL
   */
  getPlaceholderImageUrl(width) {
    // 使用数据URI作为占位图，减少请求
    const height = Math.floor(width * 0.6); // 假设16:9的比例
    const color = '#f0f0f0';
    
    // 使用SVG作为占位图
    const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${color}"/><text x="${width/2}" y="${height/2}" font-family="Arial" font-size="14" text-anchor="middle" fill="#999">图片加载中...</text></svg>`);
    
    return `data:image/svg+xml,${svg}`;
  }
  
  /**
   * 预加载图片
   * @param {Array<string>} imageUrls - 图片URL数组
   * @param {object} options - 预加载选项
   * @returns {Promise<Array>} - 预加载结果数组
   */
  preloadImages(imageUrls, options = {}) {
    const { 
      width = 300, 
      quality = 'low', 
      format = 'auto',
      onProgress = null,
      timeout = 5000
    } = options;
    
    // 转换为优化的URL
    const optimizedUrls = imageUrls.map(url => 
      this.getResponsiveImageUrl(url, { width, quality, format })
    );
    
    // 创建加载Promise数组
    const loadPromises = optimizedUrls.map((url, index) => {
      return this.loadImage(url, { timeout })
        .then(() => {
          // 更新进度
          if (typeof onProgress === 'function') {
            onProgress({ index, url, success: true, total: optimizedUrls.length });
          }
          return { url, success: true };
        })
        .catch(error => {
          console.warn(`预加载图片失败: ${url}`, error);
          // 更新进度
          if (typeof onProgress === 'function') {
            onProgress({ index, url, success: false, total: optimizedUrls.length });
          }
          return { url, success: false, error };
        });
    });
    
    return Promise.all(loadPromises);
  }
  
  /**
   * 加载单个图片
   * @param {string} url - 图片URL
   * @param {object} options - 加载选项
   * @returns {Promise} - 加载结果Promise
   */
  loadImage(url, options = {}) {
    const { timeout = 5000 } = options;
    
    // 检查是否已经加载过
    if (this.loadedImages.has(url)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId;
      
      // 设置超时
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          reject(new Error(`图片加载超时: ${url}`));
        }, timeout);
      }
      
      img.onload = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // 标记为已加载
        this.loadedImages.set(url, true);
        resolve();
      };
      
      img.onerror = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        reject(new Error(`图片加载失败: ${url}`));
      };
      
      // 设置图片URL
      img.src = url;
      
      // 如果图片已经在缓存中，立即触发onload
      if (img.complete) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.loadedImages.set(url, true);
        resolve();
      }
    });
  }
  
  /**
   * 预加载关键图片
   */
  preloadCriticalImages() {
    // 这里可以添加一些关键的、经常使用的图片URL
    // 例如，logo、导航图标等
    const criticalImages = [
      // 'path/to/logo.png',
      // 'path/to/navigation-icons.png'
    ];
    
    if (criticalImages.length > 0) {
      this.preloadImages(criticalImages, {
        quality: 'high',
        onProgress: (progress) => {
          // 可以在这里添加进度日志
          console.log(`预加载关键图片 ${progress.index + 1}/${progress.total} - ${progress.success ? '成功' : '失败'}`);
        }
      });
    }
  }
  
  /**
   * 懒加载图片
   * @param {HTMLElement} container - 容器元素
   * @param {object} options - 懒加载选项
   */
  setupLazyLoading(container, options = {}) {
    const { 
      selector = 'img[data-src]',
      threshold = 100,
      quality = 'medium',
      format = 'auto'
    } = options;
    
    // 获取容器内所有匹配的图片
    const lazyImages = Array.from(container.querySelectorAll(selector));
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            // 获取图片尺寸
            const width = img.getAttribute('width') || 800;
            
            // 获取优化后的URL
            const optimizedUrl = this.getResponsiveImageUrl(dataSrc, { width, quality, format });
            
            // 设置图片源
            img.src = optimizedUrl;
            
            // 可选：添加加载效果
            this.addLoadingEffect(img);
            
            // 移除data-src属性，避免重复加载
            img.removeAttribute('data-src');
            
            // 停止观察这张图片
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: `${threshold}px ${threshold}px ${threshold}px ${threshold}px`
    });
    
    // 观察所有懒加载图片
    lazyImages.forEach(img => {
      observer.observe(img);
    });
    
    return observer;
  }
  
  /**
   * 添加图片加载效果
   * @param {HTMLImageElement} img - 图片元素
   */
  addLoadingEffect(img) {
    // 添加淡入效果
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease-in-out';
    
    img.onload = function() {
      img.style.opacity = '1';
    };
    
    // 如果图片已经在缓存中
    if (img.complete) {
      img.style.opacity = '1';
    }
  }
  
  /**
   * 获取图片加载统计
   * @returns {object} - 加载统计信息
   */
  getLoadingStats() {
    return {
      totalLoaded: this.loadedImages.size,
      webpSupported: this.webpSupported
    };
  }
}

// 创建单例实例
const imageOptimizer = new ImageOptimizer();

// 导出工具函数
/**
 * 获取响应式图片URL
 */
export function getResponsiveImageUrl(baseUrl, options = {}) {
  return imageOptimizer.getResponsiveImageUrl(baseUrl, options);
}

/**
 * 预加载图片
 */
export function preloadImages(imageUrls, options = {}) {
  return imageOptimizer.preloadImages(imageUrls, options);
}

/**
 * 设置图片懒加载
 */
export function setupLazyLoading(container, options = {}) {
  return imageOptimizer.setupLazyLoading(container, options);
}

/**
 * 检测WebP支持
 */
export function isWebPSupported() {
  return imageOptimizer.webpSupported;
}

/**
 * 获取图片加载统计
 */
export function getImageStats() {
  return imageOptimizer.getLoadingStats();
}

// 导出实例
export default imageOptimizer;