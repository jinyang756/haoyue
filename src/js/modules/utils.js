/**
 * 通用工具函数模块
 * 提供DOM操作、日期时间格式化、数据处理等通用功能
 */

/**
 * 创建DOM元素
 * @param {string} tagName - 元素标签名
 * @param {Object} attributes - 元素属性
 * @param {Array} children - 子元素数组
 * @param {string} textContent - 文本内容
 * @returns {HTMLElement} 创建的DOM元素
 */
export function createElement(tagName, attributes = {}, children = [], textContent = '') {
  const element = document.createElement(tagName);
  
  // 设置元素属性
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'style' && typeof attributes[key] === 'object') {
      Object.keys(attributes[key]).forEach(styleKey => {
        element.style[styleKey] = attributes[key][styleKey];
      });
    } else if (key === 'dataset' && typeof attributes[key] === 'object') {
      Object.keys(attributes[key]).forEach(dataKey => {
        element.dataset[dataKey] = attributes[key][dataKey];
      });
    } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  // 设置文本内容
  if (textContent) {
    element.textContent = textContent;
  }
  
  // 添加子元素
  children.forEach(child => {
    if (child && child.nodeType) {
      element.appendChild(child);
    } else if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    }
  });
  
  return element;
}

/**
 * 格式化数字（添加千分位）
 * @param {number|string} num - 要格式化的数字
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num) {
  if (num === null || num === undefined || num === '') return '0';
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  return number.toLocaleString('zh-CN');
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取当前日期时间
 * @param {string} format - 格式化模板
 * @returns {string} 当前日期时间字符串
 */
export function getCurrentDateTime(format = 'YYYY-MM-DD HH:mm:ss') {
  return formatDate(new Date(), format);
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 动态加载CSS文件
 * @param {string} url - CSS文件URL
 * @returns {Promise} 加载完成的Promise
 */
export function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
    
    document.head.appendChild(link);
  });
}

/**
 * 动态加载JavaScript文件
 * @param {string} url - JavaScript文件URL
 * @param {Object} options - 选项
 * @returns {Promise} 加载完成的Promise
 */
export function loadJS(url, options = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    
    if (options.type) script.type = options.type;
    if (options.async !== undefined) script.async = options.async;
    if (options.defer !== undefined) script.defer = options.defer;
    
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
    
    document.head.appendChild(script);
  });
}

/**
 * 获取URL参数
 * @param {string} param - 参数名
 * @returns {string|null} 参数值
 */
export function getURLParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 平滑滚动到指定元素
 * @param {HTMLElement|string} element - 目标元素或选择器
 * @param {Object} options - 滚动选项
 */
export function scrollToElement(element, options = {}) {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;
  
  const { top, left } = target.getBoundingClientRect();
  const scrollOptions = {
    top: top + window.pageYOffset,
    left: left + window.pageXOffset,
    behavior: options.behavior || 'smooth'
  };
  
  window.scrollTo(scrollOptions);
}

/**
 * 检查元素是否在视口中
 * @param {HTMLElement} element - 要检查的元素
 * @returns {boolean} 是否在视口中
 */
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 存储数据到localStorage
 * @param {string} key - 存储键名
 * @param {any} value - 存储值
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * 从localStorage获取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 获取的数据或默认值
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * 移除localStorage中的数据
 * @param {string} key - 存储键名
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * 清空localStorage
 */
export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}