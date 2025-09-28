/**
 * 响应式图片优化工具
 * 提供图片CDN服务集成、响应式图片加载、自适应图像优化等功能
 */
class ResponsiveImages {
  constructor() {
    this.cdnBaseUrl = 'https://cdn.example.com/images'; // CDN基础URL
    this.supportedFormats = ['webp', 'avif', 'jpg', 'png'];
    this.defaultQuality = 80;
    this.breakpoints = {
      mobile: 320,
      tablet: 768,
      desktop: 1200,
      large: 1600
    };
    this.observers = new Map();
    this.init();
  }

  /**
   * 初始化响应式图片系统
   */
  init() {
    // 检测浏览器对不同图片格式的支持
    this.detectFormatSupport();
    
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

    // 构建响应式图片URL
    const responsiveUrl = this.buildResponsiveUrl(src, width, quality, format);

    // 设置图片源
    this.loadImage(img, responsiveUrl);
  }

  /**
   * 获取图片的最佳显示宽度
   * @param {HTMLImageElement} img - 图片元素
   * @returns {number} 图片宽度
   */
  getImageWidth(img) {
    // 获取图片容器的宽度
    let containerWidth = img.parentElement.clientWidth;
    
    // 考虑设备像素比以支持高分辨率屏幕
    const dpr = window.devicePixelRatio || 1;
    
    // 获取最近的断点
    const width = Math.min(containerWidth, this.getNearestBreakpoint(containerWidth));
    
    return Math.floor(width * dpr);
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
   * @returns {string} 构建的URL
   */
  buildResponsiveUrl(src, width, quality, format) {
    // 如果是绝对URL，直接返回
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // 移除扩展名
    const baseName = src.split('.').slice(0, -1).join('.');
    const originalExt = src.split('.').pop();
    
    // 构建CDN URL
    return `${this.cdnBaseUrl}/${baseName}?w=${width}&q=${quality}&format=${format}`;
  }

  /**
   * 加载图片
   * @param {HTMLImageElement} img - 图片元素
   * @param {string} url - 图片URL
   */
  loadImage(img, url) {
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = url;
      
      // 移除data-src属性以避免重复加载
      if (img.dataset.src) {
        delete img.dataset.src;
      }
      
      // 触发加载完成事件
      img.dispatchEvent(new Event('responsive-image-loaded'));
    };
    
    tempImg.onerror = () => {
      console.warn(`Failed to load responsive image: ${url}`);
      
      // 尝试回退到原始图片
      if (img.dataset.fallbackSrc) {
        img.src = img.dataset.fallbackSrc;
      }
    };
    
    tempImg.src = url;
  }

  /**
   * 观察图片元素，当进入视口时加载
   * @param {HTMLImageElement} img - 图片元素
   */
  observeImage(img) {
    if (!('IntersectionObserver' in window)) {
      // 不支持IntersectionObserver，直接加载
      this.processResponsiveImage(img);
      return;
    }
    
    let observer = this.observers.get('imageObserver');
    
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.processResponsiveImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px 0px',
        threshold: 0.1
      });
      
      this.observers.set('imageObserver', observer);
    }
    
    observer.observe(img);
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