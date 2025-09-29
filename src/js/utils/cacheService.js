/**
 * 缓存服务 - 提供本地存储缓存和IndexedDB存储功能
 */

import { AppConfig, log } from './config.js';

/**
 * 缓存服务类
 * 提供本地存储缓存、IndexedDB存储和数据过期策略
 */
export const CacheService = {
  /**
   * 设置本地存储缓存
   * @param {string} key - 缓存键名
   * @param {any} data - 缓存数据
   * @param {number} expirationMinutes - 过期时间（分钟），默认从配置读取
   */
  setCache(key, data, expirationMinutes = AppConfig.cache.expiry / 1000 / 60) {
    try {
      const item = {
        data,
        expiration: new Date().getTime() + (expirationMinutes * 60 * 1000)
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      log(`设置缓存失败: ${error}`, 'error');
    }
  },
  
  /**
   * 获取本地存储缓存
   * @param {string} key - 缓存键名
   * @returns {any|null} - 缓存数据，如果缓存不存在或已过期则返回null
   */
  getCache(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item);
      if (new Date().getTime() > parsedItem.expiration) {
        // 缓存已过期，移除缓存
        localStorage.removeItem(key);
        return null;
      }
      
      return parsedItem.data;
    } catch (error) {
      log(`获取缓存失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 清除指定的本地存储缓存
   * @param {string} key - 缓存键名
   */
  clearCache(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      log(`清除缓存失败: ${error}`, 'error');
    }
  },
  
  /**
   * 清除所有本地存储缓存
   */
  clearAllCache() {
    try {
      localStorage.clear();
    } catch (error) {
      log(`清除所有缓存失败: ${error}`, 'error');
    }
  },
  
  /**
   * 初始化IndexedDB数据库
   * @param {string} dbName - 数据库名称
   * @param {number} version - 数据库版本
   * @param {Array} stores - 存储对象配置数组
   * @returns {Promise<IDBDatabase>} - 返回数据库实例的Promise
   */
  initIndexedDB(dbName, version, stores) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onerror = (event) => {
        log(`IndexedDB初始化失败: ${event.target.error}`, 'error');
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建或更新存储对象
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement || false
            });
            
            // 创建索引
            if (store.indexes) {
              store.indexes.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false
                });
              });
            }
          }
        });
      };
    });
  },
  
  /**
   * 在IndexedDB中存储数据
   * @param {IDBDatabase} db - 数据库实例
   * @param {string} storeName - 存储对象名称
   * @param {any} data - 要存储的数据
   * @returns {Promise<void>} - 存储操作完成的Promise
   */
  storeInIndexedDB(db, storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // 为数据添加时间戳
      const dataWithTimestamp = {
        ...data,
        timestamp: new Date().getTime()
      };
      
      const request = store.put(dataWithTimestamp);
      
      request.onerror = (event) => {
        log(`IndexedDB存储失败: ${event.target.error}`, 'error');
        reject(event.target.error);
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  },
  
  /**
   * 从IndexedDB中获取数据
   * @param {IDBDatabase} db - 数据库实例
   * @param {string} storeName - 存储对象名称
   * @param {string|number} key - 数据键名
   * @param {number} maxAgeMinutes - 最大有效时间（分钟），超过此时间的数据将被视为过期
   * @returns {Promise<any|null>} - 返回数据的Promise，如果不存在或已过期则返回null
   */
  getFromIndexedDB(db, storeName, key, maxAgeMinutes = null) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(key);
      
      request.onerror = (event) => {
        log(`IndexedDB获取失败: ${event.target.error}`, 'error');
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // 检查数据是否过期
        if (maxAgeMinutes && result.timestamp) {
          const ageInMinutes = (new Date().getTime() - result.timestamp) / (1000 * 60);
          if (ageInMinutes > maxAgeMinutes) {
            // 数据已过期，删除并返回null
            this.deleteFromIndexedDB(db, storeName, key);
            resolve(null);
            return;
          }
        }
        
        resolve(result);
      };
    });
  },
  
  /**
   * 从IndexedDB中删除数据
   * @param {IDBDatabase} db - 数据库实例
   * @param {string} storeName - 存储对象名称
   * @param {string|number} key - 数据键名
   * @returns {Promise<void>} - 删除操作完成的Promise
   */
  deleteFromIndexedDB(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      
      request.onerror = (event) => {
        log(`IndexedDB删除失败: ${event.target.error}`, 'error');
        reject(event.target.error);
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  },
  
  /**
   * 清理过期的缓存数据
   * 定时清理本地存储中已过期的数据
   */
  cleanupExpiredCache() {
    try {
      const now = new Date().getTime();
      
      // 遍历所有本地存储项
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsedItem = JSON.parse(item);
            // 检查是否有过期时间且已过期
            if (parsedItem.expiration && now > parsedItem.expiration) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // 忽略无法解析的项
        }
      }
    } catch (error) {
      log(`清理过期缓存失败: ${error}`, 'error');
    }
  }
};

/**
 * 带缓存的Fetch请求
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @param {string} cacheKey - 缓存键名
 * @param {number} cacheMinutes - 缓存时间（分钟）
 * @param {string} apiType - 可选，API类型，使用DATA_SOURCE_API中的常量
 * @returns {Promise<any>} - 返回请求结果的Promise
 */
export async function fetchWithCache(url, options = {}, cacheKey = null, cacheMinutes = 10, apiType = null) {
  // 合并默认选项和用户提供的选项
  let fetchOptions = {
    ...options,
    timeout: AppConfig.api.timeout // 使用配置中的超时时间
  };
  
  // 如果指定了API类型，添加授权头
  if (apiType) {
    try {
      // 延迟导入以避免循环依赖
      const { apiKeyManager } = await import('./apiKeyManager.js');
      fetchOptions = await apiKeyManager.addAuthHeader(apiType, fetchOptions);
    } catch (error) {
      log(`添加API授权头失败: ${error}`, 'warn');
      // 继续执行，让调用方决定如何处理授权失败
    }
  }
  
  // 如果没有提供缓存键，则使用URL作为键
  const key = cacheKey || `fetch_${url.replace(/\//g, '_')}`;
  
  // 尝试从缓存获取数据
  const cachedData = CacheService.getCache(key);
  if (cachedData) {
    log(`从缓存获取数据: ${key}`);
    return cachedData;
  }
  
  // 缓存未命中，发送请求
  try {
    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AppConfig.api.timeout);
    
    try {
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
    
    const data = await response.json();
    
    // 缓存数据
      CacheService.setCache(key, data, cacheMinutes);
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId); // 确保清除超时计时器
      log(`请求失败: ${url}, 错误: ${error}`, 'error');
      throw error;
    }
  } catch (error) {
    log(`fetchWithCache 执行失败: ${error}`, 'error');
    throw error;
  }
}

// 定期清理过期缓存（从配置中读取时间间隔）
const cleanupInterval = 60 * 60 * 1000; // 默认1小时
setInterval(CacheService.cleanupExpiredCache, cleanupInterval);

// 立即清理一次过期缓存
try {
  CacheService.cleanupExpiredCache();
} catch (error) {
  log(`初始化缓存清理失败: ${error}`, 'error');
}

// 导出默认对象
export default CacheService;