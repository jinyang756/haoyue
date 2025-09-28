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
 * HTML转义处理
 * @param {string} unsafe - 不安全的输入
 * @returns {string} - 转义后的安全输入
 */
function escapeHTML(unsafe) {
  if (!unsafe) return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 输入验证和过滤
 * @param {string} input - 输入文本
 * @param {string} type - 输入类型 (text, email, phone, html)
 * @returns {string} - 验证和过滤后的文本
 */
export function validateAndSanitizeInput(input, type = 'text') {
  if (!input) return '';
  
  let sanitizedInput = input.trim();
  
  // 根据输入类型进行不同的验证和过滤
  switch (type) {
    case 'text':
      // 移除HTML标签
      sanitizedInput = sanitizedInput.replace(/<[^>]*>/g, '');
      break;
      
    case 'email':
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedInput)) {
        throw new Error('请输入有效的邮箱地址');
      }
      break;
      
    case 'phone':
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(sanitizedInput.replace(/\D/g, ''))) {
        throw new Error('请输入有效的手机号码');
      }
      sanitizedInput = sanitizedInput.replace(/\D/g, '');
      break;
      
    case 'html':
      // 允许特定的HTML标签和属性
      const allowedTags = ['b', 'i', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li'];
      const allowedAttributes = ['href', 'title'];
      
      // 使用DOMParser解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitizedInput, 'text/html');
      
      // 递归过滤节点
      function filterNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查标签是否被允许
          if (!allowedTags.includes(node.tagName.toLowerCase())) {
            return document.createTextNode(node.outerHTML);
          }
          
          // 移除不允许的属性
          Array.from(node.attributes).forEach(attr => {
            if (!allowedAttributes.includes(attr.name.toLowerCase())) {
              node.removeAttribute(attr.name);
            }
          });
          
          // 处理a标签的href属性，确保安全
          if (node.tagName.toLowerCase() === 'a' && node.hasAttribute('href')) {
            const href = node.getAttribute('href');
            if (!href.startsWith('http://') && !href.startsWith('https://')) {
              node.removeAttribute('href');
            }
          }
        }
        
        // 递归处理子节点
        Array.from(node.childNodes).forEach(child => {
          const filteredChild = filterNode(child);
          if (filteredChild !== child) {
            node.replaceChild(filteredChild, child);
          }
        });
        
        return node;
      }
      
      // 过滤所有节点
      const filteredBody = filterNode(doc.body);
      
      // 获取过滤后的HTML
      sanitizedInput = Array.from(filteredBody.childNodes).map(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node.outerHTML;
        } else {
          return node.textContent;
        }
      }).join('');
      
      break;
  }
  
  return sanitizedInput;
}

/**
 * 清理输入以防止XSS攻击
 * @param {string} input - 输入文本
 * @param {string} type - 输入类型 (text, email, phone, html)
 * @returns {string} - 清理后的文本
 */
export function sanitizeInput(input, type = 'text') {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  try {
    return validateAndSanitizeInput(input, type);
  } catch (error) {
    console.error('输入验证失败:', error);
    // 回退到基本的HTML转义
    const element = document.createElement('div');
    element.textContent = input;
    return element.innerHTML;
  }
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
 * 安全存储管理器
 * 使用Web Crypto API实现数据加密与安全存储
 */
export const SecureStorage = {
  // 从环境或配置中获取加密密钥
  // 实际应用中应从更安全的渠道获取密钥
  get ENCRYPTION_KEY() {
    // 这里使用一个默认密钥，实际应用中应该从配置或环境变量中获取
    return window._secureConfig?.encryptionKey || 'moonlight-ai-secure-key-2023';
  },
  
  // 初始化加密密钥
  async initKey() {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('浏览器不支持Web Crypto API，将使用普通存储');
      return null;
    }
    
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(this.ENCRYPTION_KEY),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      
      return keyMaterial;
    } catch (error) {
      console.error('初始化加密密钥失败:', error);
      return null;
    }
  },
  
  // 加密数据
  async encryptData(data) {
    try {
      const key = await this.initKey();
      
      // 如果不支持加密或初始化密钥失败，返回原始数据
      if (!key) {
        return JSON.stringify(data);
      }
      
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      // 生成随机IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // 加密数据
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
      );
      
      // 将IV和加密数据组合成一个ArrayBuffer
      const resultBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      resultBuffer.set(iv, 0);
      resultBuffer.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // 转换为Base64字符串
      return btoa(String.fromCharCode.apply(null, resultBuffer));
    } catch (error) {
      console.error('数据加密失败:', error);
      // 加密失败时返回原始数据的JSON字符串
      return JSON.stringify(data);
    }
  },
  
  // 解密数据
  async decryptData(encryptedData) {
    try {
      const key = await this.initKey();
      
      // 如果不支持加密或初始化密钥失败，直接解析原始数据
      if (!key) {
        return JSON.parse(encryptedData);
      }
      
      // 将Base64字符串转换为ArrayBuffer
      const resultBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // 提取IV和加密数据
      const iv = resultBuffer.subarray(0, 12);
      const encryptedBuffer = resultBuffer.subarray(12);
      
      // 解密数据
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedBuffer
      );
      
      // 转换为字符串并解析为JSON
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedBuffer));
    } catch (error) {
      console.error('数据解密失败:', error);
      // 尝试直接解析数据（兼容之前未加密的数据）
      try {
        return JSON.parse(encryptedData);
      } catch (e) {
        return null;
      }
    }
  },
  
  // 安全存储数据
  async setItem(key, data) {
    try {
      // 加密数据
      const encryptedData = await this.encryptData(data);
      
      // 存储加密后的数据
      localStorage.setItem(key, encryptedData);
      
      return true;
    } catch (error) {
      console.error('安全存储失败:', error);
      return false;
    }
  },
  
  // 获取安全存储的数据
  async getItem(key) {
    try {
      // 获取加密后的数据
      const encryptedData = localStorage.getItem(key);
      
      if (!encryptedData) {
        return null;
      }
      
      // 解密数据
      const data = await this.decryptData(encryptedData);
      
      return data;
    } catch (error) {
      console.error('安全获取数据失败:', error);
      return null;
    }
  },
  
  // 删除安全存储的数据
  removeItem(key) {
    localStorage.removeItem(key);
  }
};

/**
 * 获取安全的本地存储数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} - 存储的值或默认值
 */
export async function getSafeLocalStorage(key, defaultValue = null) {
  try {
    // 尝试使用SecureStorage获取数据
    const result = await SecureStorage.getItem(key);
    if (result !== undefined) {
      return result;
    }
    
    // 兼容旧版数据
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
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
export async function setSafeLocalStorage(key, value) {
  try {
    // 使用SecureStorage存储数据
    return await SecureStorage.setItem(key, value);
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
    // 使用SecureStorage删除数据
    SecureStorage.removeItem(key);
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

/**
 * 登录安全管理器
 * 处理登录失败次数限制、账户锁定等安全功能
 */
export const LoginSecurity = {
  // 最大失败次数
  MAX_FAILED_ATTEMPTS: 5,
  
  // 锁定时间（分钟）
  LOCK_DURATION: 15,
  
  // 记录登录失败次数
  async recordFailedAttempt(username) {
    const failedAttempts = await this.getFailedAttempts();
    
    if (!failedAttempts[username]) {
      failedAttempts[username] = {
        count: 1,
        lastAttempt: new Date().getTime()
      };
    } else {
      failedAttempts[username].count++;
      failedAttempts[username].lastAttempt = new Date().getTime();
    }
    
    await setSafeLocalStorage('login_failed_attempts', failedAttempts);
    
    return failedAttempts[username].count;
  },
  
  // 获取登录失败次数
  async getFailedAttempts() {
    const attempts = await getSafeLocalStorage('login_failed_attempts');
    return attempts || {};
  },
  
  // 检查账户是否被锁定
  async isAccountLocked(username) {
    const failedAttempts = await this.getFailedAttempts();
    
    if (!failedAttempts[username] || failedAttempts[username].count < this.MAX_FAILED_ATTEMPTS) {
      return false;
    }
    
    const lockUntil = failedAttempts[username].lastAttempt + (this.LOCK_DURATION * 60 * 1000);
    return new Date().getTime() < lockUntil;
  },
  
  // 获取账户锁定剩余时间（分钟）
  async getLockRemainingTime(username) {
    const failedAttempts = await this.getFailedAttempts();
    
    if (!failedAttempts[username] || failedAttempts[username].count < this.MAX_FAILED_ATTEMPTS) {
      return 0;
    }
    
    const lockUntil = failedAttempts[username].lastAttempt + (this.LOCK_DURATION * 60 * 1000);
    const remainingTime = Math.ceil((lockUntil - new Date().getTime()) / (60 * 1000));
    
    return remainingTime > 0 ? remainingTime : 0;
  },
  
  // 重置登录失败次数
  async resetFailedAttempts(username) {
    const failedAttempts = await this.getFailedAttempts();
    
    if (failedAttempts[username]) {
      delete failedAttempts[username];
      await setSafeLocalStorage('login_failed_attempts', failedAttempts);
    }
  }
};