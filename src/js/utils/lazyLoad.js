/**
 * 图片懒加载工具 - 实现图片的延迟加载以提高性能
 */

/**
 * 图片懒加载类
 */
export class LazyLoad {
  constructor() {
    this.observer = null;
    this.init();
  }
  
  /**
   * 初始化懒加载观察者
   */
  init() {
    // 检查浏览器是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
      // 创建观察者实例
      this.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            this.loadImage(image);
            observer.unobserve(image);
          }
        });
      }, {
        rootMargin: '50px 0px', // 在图片进入视口前50px就开始加载
        threshold: 0.01 // 当图片的1%进入视口时触发
      });
    }
    
    // 监听DOMContentLoaded事件，初始化懒加载
    document.addEventListener('DOMContentLoaded', () => {
      this.lazyLoadImages();
    });
    
    // 监听页面切换事件，重新初始化懒加载
    if (window.addEventListener) {
      window.addEventListener('pageChange', () => {
        // 延迟执行，确保DOM已更新
        setTimeout(() => {
          this.lazyLoadImages();
        }, 100);
      });
    }
  }
  
  /**
   * 加载指定的图片
   * @param {HTMLImageElement} image - 要加载的图片元素
   */
  loadImage(image) {
    if (!image || !image.dataset.src) return;
    
    // 获取实际图片地址
    const src = image.dataset.src;
    const srcset = image.dataset.srcset;
    const sizes = image.dataset.sizes;
    
    // 创建临时图片用于预加载
    const tempImg = new Image();
    
    // 设置加载成功事件
    tempImg.onload = () => {
      // 设置图片属性
      if (src) image.src = src;
      if (srcset) image.srcset = srcset;
      if (sizes) image.sizes = sizes;
      
      // 添加加载完成的类名，用于触发过渡效果
      image.classList.add('lazyloaded');
      
      // 移除懒加载类名
      image.classList.remove('lazyload');
      
      // 如果有占位图，可以隐藏或移除它
      const placeholder = image.previousElementSibling;
      if (placeholder && placeholder.classList.contains('lazy-placeholder')) {
        placeholder.style.display = 'none';
      }
    };
    
    // 设置加载错误事件
    tempImg.onerror = () => {
      console.error(`图片加载失败: ${src}`);
      // 可以设置一个错误占位图
      if (image.dataset.errorSrc) {
        image.src = image.dataset.errorSrc;
      }
      
      // 添加加载错误的类名
      image.classList.add('lazyerror');
      image.classList.remove('lazyload');
    };
    
    // 开始预加载
    if (srcset) tempImg.srcset = srcset;
    if (sizes) tempImg.sizes = sizes;
    tempImg.src = src;
  }
  
  /**
   * 对页面上的所有懒加载图片进行处理
   */
  lazyLoadImages() {
    // 获取所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img.lazyload');
    
    if (this.observer) {
      // 使用IntersectionObserver处理
      lazyImages.forEach(image => {
        this.observer.observe(image);
      });
    } else {
      // 降级方案：使用滚动事件处理
      this.fallbackLazyLoad(lazyImages);
    }
  }
  
  /**
   * 降级方案：当浏览器不支持IntersectionObserver时使用
   * @param {NodeList} images - 图片元素列表
   */
  fallbackLazyLoad(images) {
    const imageArray = Array.from(images);
    
    // 检查图片是否在视口中的函数
    const checkImages = () => {
      imageArray.forEach((image, index) => {
        if (this.isInViewport(image)) {
          this.loadImage(image);
          // 从数组中移除已加载的图片
          imageArray.splice(index, 1);
          
          // 如果所有图片都已加载，移除滚动事件监听
          if (imageArray.length === 0) {
            window.removeEventListener('scroll', checkImages);
            window.removeEventListener('resize', checkImages);
            window.removeEventListener('orientationchange', checkImages);
          }
        }
      });
    };
    
    // 初始检查一次
    checkImages();
    
    // 添加滚动、调整窗口大小和设备方向变化事件监听
    window.addEventListener('scroll', this.throttle(checkImages, 200));
    window.addEventListener('resize', this.throttle(checkImages, 200));
    window.addEventListener('orientationchange', checkImages);
  }
  
  /**
   * 检查元素是否在视口中
   * @param {HTMLElement} element - 要检查的元素
   * @returns {boolean} - 元素是否在视口中
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // 考虑元素完全在视口中或部分在视口中
    const isVisible = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (windowHeight + 300) && // 提前300px开始加载
      rect.right <= (windowWidth + 300)     // 提前300px开始加载
    );
    
    return isVisible;
  }
  
  /**
   * 节流函数 - 限制函数的执行频率
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 时间限制（毫秒）
   * @returns {Function} - 节流后的函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * 添加新的懒加载图片
   * @param {HTMLImageElement|NodeList} images - 要添加的图片元素或元素列表
   */
  addImages(images) {
    if (images instanceof NodeList) {
      images.forEach(image => {
        if (image.classList.contains('lazyload')) {
          this.observer?.observe(image);
        }
      });
    } else if (images instanceof HTMLImageElement) {
      if (images.classList.contains('lazyload')) {
        this.observer?.observe(images);
      }
    }
  }
  
  /**
   * 销毁懒加载观察者
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * 创建懒加载实例并导出
 */
export const lazyLoader = new LazyLoad();

/**
 * 初始化图片懒加载
 * 全局函数，方便在其他地方调用
 */
export function initLazyLoad() {
  // 确保只有一个实例
  if (!window.lazyLoaderInstance) {
    window.lazyLoaderInstance = lazyLoader;
  }
  return window.lazyLoaderInstance;
}

/**
 * 为图片添加懒加载功能
 * @param {string|HTMLImageElement} selectorOrElement - CSS选择器或图片元素
 * @param {Object} options - 配置选项
 */
export function addLazyLoad(selectorOrElement, options = {}) {
  // 获取懒加载实例
  const instance = initLazyLoad();
  
  if (typeof selectorOrElement === 'string') {
    // 选择器模式
    const images = document.querySelectorAll(selectorOrElement);
    
    images.forEach(image => {
      // 如果图片已经有懒加载类，先移除
      if (image.classList.contains('lazyload')) {
        image.classList.remove('lazyload');
      }
      
      // 设置图片属性
      if (options.src && !image.dataset.src) {
        image.dataset.src = image.src;
        image.src = options.placeholder || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%221%22 height%3D%221%22%3E%3C%2Fsvg%3E';
      }
      
      // 添加懒加载类
      image.classList.add('lazyload');
    });
    
    // 通知实例添加了新图片
    instance.addImages(images);
  } else if (selectorOrElement instanceof HTMLImageElement) {
    // 单元素模式
    const image = selectorOrElement;
    
    // 如果图片已经有懒加载类，先移除
    if (image.classList.contains('lazyload')) {
      image.classList.remove('lazyload');
    }
    
    // 设置图片属性
    if (options.src && !image.dataset.src) {
      image.dataset.src = image.src;
      image.src = options.placeholder || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%221%22 height%3D%221%22%3E%3C%2Fsvg%3E';
    }
    
    // 添加懒加载类
    image.classList.add('lazyload');
    
    // 通知实例添加了新图片
    instance.addImages(image);
  }
}