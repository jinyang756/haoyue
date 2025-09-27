// 安全工具模块 - 提供基础的安全相关功能

/**
 * 验证邮箱格式
 * @param {string} email - 要验证的邮箱地址
 * @returns {boolean} - 邮箱格式是否有效
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // 简单的邮箱格式验证正则
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * @param {string} phone - 要验证的手机号
 * @returns {boolean} - 手机号格式是否有效
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // 中国大陆手机号验证正则
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param {string} password - 要验证的密码
 * @returns {Object} - 包含验证结果和提示信息
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: '密码不能为空',
      strength: 'weak'
    };
  }
  
  let score = 0;
  let messages = [];
  
  // 长度检查
  if (password.length < 8) {
    messages.push('密码长度至少为8位');
  } else {
    score += 1;
    if (password.length >= 12) {
      score += 1;
    }
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    messages.push('密码应包含小写字母');
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    messages.push('密码应包含大写字母');
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    messages.push('密码应包含数字');
  }
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    messages.push('密码应包含特殊字符');
  }
  
  // 计算密码强度
  let strength = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }
  
  return {
    isValid: score >= 3, // 至少中等强度
    message: messages.join('，') || '密码强度良好',
    strength: strength
  };
}

/**
 * 防止XSS攻击的简单输入清理
 * @param {string} input - 要清理的输入文本
 * @returns {string} - 清理后的文本
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // 简单的HTML标签转义
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} - 随机ID
 */
export function generateRandomId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * 检查是否为URL
 * @param {string} url - 要检查的URL字符串
 * @returns {boolean} - 是否为有效的URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检测是否为移动设备
 * @returns {boolean} - 当前是否为移动设备
 */
export function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // 简单的移动设备检测
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

/**
 * 获取安全的本地存储数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} - 存储的值或默认值
 */
export function getSafeLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('获取本地存储数据失败:', error);
    return defaultValue;
  }
}

/**
 * 设置安全的本地存储数据
 * @param {string} key - 存储键名
 * @param {any} value - 要存储的值
 * @returns {boolean} - 设置是否成功
 */
export function setSafeLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('设置本地存储数据失败:', error);
    return false;
  }
}

/**
 * 删除本地存储数据
 * @param {string} key - 要删除的存储键名
 * @returns {boolean} - 删除是否成功
 */
export function removeSafeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除本地存储数据失败:', error);
    return false;
  }
}

/**
 * 格式化日期时间为安全的字符串格式
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期时间字符串
 */
export function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString();
}

/**
 * 限制输入长度
 * @param {string} input - 输入文本
 * @param {number} maxLength - 最大长度
 * @returns {string} - 限制长度后的文本
 */
export function limitInputLength(input, maxLength) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.substring(0, maxLength);
}

/**
 * 验证用户输入是否为空
 * @param {string} input - 要验证的输入
 * @param {boolean} trim - 是否去除前后空格
 * @returns {boolean} - 是否为空
 */
export function isEmptyInput(input, trim = true) {
  if (input === null || input === undefined) {
    return true;
  }
  
  if (typeof input === 'string') {
    return trim ? input.trim() === '' : input === '';
  }
  
  return false;
}

/**
 * 防抖函数
 * 用于限制函数的执行频率
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} - 防抖处理后的函数
 */
export function debounce(func, delay) {
  let timeoutId;
  
  return function (...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
}

/**
 * 节流函数
 * 用于控制函数的执行频率
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} - 节流处理后的函数
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function (...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}