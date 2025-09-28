// 环境变量配置管理

/**
 * 获取环境变量值
 * @param {string} key - 环境变量键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 环境变量值或默认值
 */
export function getEnv(key, defaultValue = null) {
  const value = import.meta.env[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // 尝试解析布尔值
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // 尝试解析数字
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  
  return value;
}

/**
 * 应用配置对象
 */
export const AppConfig = {
  // API配置
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', 'https://api.example.com'),
    timeout: getEnv('VITE_API_TIMEOUT', 10000)
  },
  
  // 缓存配置
  cache: {
    expiry: getEnv('VITE_CACHE_EXPIRY', 3600000), // 默认1小时
    sizeLimit: getEnv('VITE_CACHE_SIZE_LIMIT', 52428800) // 默认50MB
  },
  
  // 应用信息
  app: {
    title: getEnv('VITE_APP_TITLE', '皓月量化智能引擎'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    debug: getEnv('VITE_APP_DEBUG', false)
  },
  
  // 安全配置
  security: {
    xssProtection: getEnv('VITE_SECURITY_XSS_PROTECTION', true),
    csp: getEnv('VITE_SECURITY_CSP', true)
  },
  
  // 功能开关
  features: {
    analytics: getEnv('VITE_FEATURE_ANALYTICS', true),
    adminPanel: getEnv('VITE_FEATURE_ADMIN_PANEL', false),
    charityMode: getEnv('VITE_FEATURE_CHARITY_MODE', true)
  }
};

/**
 * 日志工具，根据debug模式决定是否输出日志
 * @param {any} message - 日志消息
 * @param {string} level - 日志级别
 */
export function log(message, level = 'info') {
  if (AppConfig.app.debug) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${level.toUpperCase()}]`, message);
  }
}

export default AppConfig;