/**
 * 高级缓存策略工具 - 扩展基础缓存服务，提供更智能的缓存管理
 */

import CacheService, { fetchWithCache } from './cacheService.js';
import { AppConfig, log } from './config.js';

/**
 * 缓存优先级枚举
 */
export const CachePriority = {
  CRITICAL: 'critical',  // 关键数据，应始终保持在缓存中
  HIGH: 'high',          // 高频访问数据，优先保留
  MEDIUM: 'medium',      // 普通数据
  LOW: 'low',            // 低频访问数据
  TRANSIENT: 'transient' // 临时数据，可快速丢弃
};

/**
 * 高级缓存管理类
 */
export const AdvancedCacheManager = {
  // 存储缓存项的元数据
  cacheRegistry: new Map(),
  
  // 当前缓存使用统计
  cacheStats: {
    usage: 0, // 当前使用的缓存空间（字节）
    limit: AppConfig.cache.maxSize || 5 * 1024 * 1024, // 默认5MB缓存限制
    hits: 0,
    misses: 0,
    evictions: 0
  },
  
  /**
   * 初始化高级缓存管理器
   */
  init() {
    try {
      // 加载缓存注册表
      this.loadCacheRegistry();
      
      // 计算当前缓存使用情况
      this.calculateCacheUsage();
      
      // 设置定期维护任务
      this.setupMaintenanceTasks();
      
      log('高级缓存管理器初始化成功');
    } catch (error) {
      log(`高级缓存管理器初始化失败: ${error}`, 'error');
    }
  },
  
  /**
   * 设置优先级缓存
   * @param {string} key - 缓存键名
   * @param {any} data - 缓存数据
   * @param {Object} options - 缓存选项
   */
  setPriorityCache(key, data, options = {}) {
    try {
      const { 
        priority = CachePriority.MEDIUM, 
        expirationMinutes = AppConfig.cache.expiry / 1000 / 60,
        tags = [],
        staleWhileRevalidate = false // 是否使用stale-while-revalidate策略
      } = options;
      
      // 计算数据大小
      const dataSize = this.calculateDataSize(data);
      
      // 缓存数据前检查空间
      this.ensureCacheSpace(dataSize);
      
      // 使用基础缓存服务存储数据
      CacheService.setCache(key, data, expirationMinutes);
      
      // 记录缓存元数据
      this.updateCacheMetadata(key, {
        priority,
        size: dataSize,
        tags,
        creationTime: new Date().getTime(),
        lastAccessTime: new Date().getTime(),
        hits: 0,
        staleWhileRevalidate
      });
      
      // 更新缓存统计
      this.updateCacheStats(dataSize, true);
      
      return true;
    } catch (error) {
      log(`设置优先级缓存失败: ${key}, 错误: ${error}`, 'error');
      return false;
    }
  },
  
  /**
   * 获取优先级缓存
   * @param {string} key - 缓存键名
   * @returns {any|null} - 缓存数据，如果不存在、已过期或被淘汰则返回null
   */
  getPriorityCache(key) {
    try {
      // 获取缓存元数据
      const metadata = this.cacheRegistry.get(key);
      
      if (!metadata) {
        this.updateCacheStats(0, false);
        return null;
      }
      
      // 尝试获取缓存数据
      const cachedData = CacheService.getCache(key);
      
      if (!cachedData) {
        // 数据不存在或已过期，从注册表中移除
        this.removeFromRegistry(key);
        this.updateCacheStats(0, false);
        return null;
      }
      
      // 更新访问时间和命中次数
      metadata.lastAccessTime = new Date().getTime();
      metadata.hits += 1;
      this.updateCacheMetadata(key, metadata);
      
      // 更新缓存统计
      this.updateCacheStats(0, true);
      
      return cachedData;
    } catch (error) {
      log(`获取优先级缓存失败: ${key}, 错误: ${error}`, 'error');
      this.updateCacheStats(0, false);
      return null;
    }
  },
  
  /**
   * 带优先级缓存的Fetch请求
   * @param {string} url - 请求URL
   * @param {Object} options - fetch选项
   * @param {Object} cacheOptions - 缓存选项
   * @returns {Promise<any>} - 返回请求结果的Promise
   */
  async fetchWithPriorityCache(url, options = {}, cacheOptions = {}) {
    const { 
      priority = CachePriority.MEDIUM,
      cacheKey = null,
      cacheMinutes = 10,
      staleWhileRevalidate = false
    } = cacheOptions;
    
    // 生成缓存键
    const key = cacheKey || `fetch_${url.replace(/\//g, '_')}`;
    
    // 尝试获取缓存
    const cachedData = this.getPriorityCache(key);
    
    // 如果启用了stale-while-revalidate且有缓存数据，先返回缓存，然后后台刷新
    if (cachedData && staleWhileRevalidate) {
      // 后台刷新缓存
      setTimeout(async () => {
        try {
          const freshData = await fetchWithCache(url, options, null, cacheMinutes);
          this.setPriorityCache(key, freshData, {
            priority,
            expirationMinutes: cacheMinutes,
            staleWhileRevalidate
          });
        } catch (error) {
          log(`后台刷新缓存失败: ${url}, 错误: ${error}`, 'error');
        }
      }, 0);
      
      return cachedData;
    }
    
    // 缓存未命中或未启用stale-while-revalidate，正常获取数据
    try {
      const data = await fetchWithCache(url, options, null, cacheMinutes);
      
      // 存储到优先级缓存
      this.setPriorityCache(key, data, {
        priority,
        expirationMinutes: cacheMinutes,
        staleWhileRevalidate
      });
      
      return data;
    } catch (error) {
      // 请求失败，如果有缓存数据则返回缓存（降级策略）
      if (cachedData) {
        log(`请求失败，使用缓存降级: ${url}`);
        return cachedData;
      }
      
      throw error;
    }
  },
  
  /**
   * 清除特定标签的缓存
   * @param {string|Array<string>} tags - 缓存标签
   */
  clearCacheByTags(tags) {
    try {
      const tagSet = new Set(Array.isArray(tags) ? tags : [tags]);
      let clearedCount = 0;
      
      // 检查并清除匹配的缓存
      for (const [key, metadata] of this.cacheRegistry.entries()) {
        if (metadata.tags.some(tag => tagSet.has(tag))) {
          CacheService.clearCache(key);
          this.removeFromRegistry(key);
          clearedCount++;
        }
      }
      
      // 重新计算缓存使用情况
      this.calculateCacheUsage();
      
      log(`按标签清除缓存完成，共清除 ${clearedCount} 项`);
      return clearedCount;
    } catch (error) {
      log(`按标签清除缓存失败: ${error}`, 'error');
      return 0;
    }
  },
  
  /**
   * 清除特定优先级以下的缓存
   * @param {string} priorityThreshold - 优先级阈值
   */
  clearCacheBelowPriority(priorityThreshold) {
    try {
      const priorityOrder = [
        CachePriority.TRANSIENT,
        CachePriority.LOW,
        CachePriority.MEDIUM,
        CachePriority.HIGH,
        CachePriority.CRITICAL
      ];
      
      const thresholdIndex = priorityOrder.indexOf(priorityThreshold);
      if (thresholdIndex === -1) {
        log(`无效的优先级阈值: ${priorityThreshold}`);
        return 0;
      }
      
      let clearedCount = 0;
      
      // 清除低于阈值的缓存
      for (const [key, metadata] of this.cacheRegistry.entries()) {
        const currentIndex = priorityOrder.indexOf(metadata.priority);
        if (currentIndex !== -1 && currentIndex < thresholdIndex) {
          CacheService.clearCache(key);
          this.removeFromRegistry(key);
          clearedCount++;
        }
      }
      
      // 重新计算缓存使用情况
      this.calculateCacheUsage();
      
      log(`清除优先级低于 ${priorityThreshold} 的缓存完成，共清除 ${clearedCount} 项`);
      return clearedCount;
    } catch (error) {
      log(`按优先级清除缓存失败: ${error}`, 'error');
      return 0;
    }
  },
  
  /**
   * 确保有足够的缓存空间
   * @param {number} requiredSize - 所需空间大小（字节）
   */
  ensureCacheSpace(requiredSize) {
    try {
      const totalRequired = this.cacheStats.usage + requiredSize;
      
      // 如果当前使用量加上所需量小于限制，直接返回
      if (totalRequired < this.cacheStats.limit) {
        return true;
      }
      
      log(`缓存空间不足，需要清理: 当前 ${this.formatSize(this.cacheStats.usage)} / ${this.formatSize(this.cacheStats.limit)}`);
      
      // 缓存淘汰策略: 基于优先级、访问时间和大小
      const cacheEntries = Array.from(this.cacheRegistry.entries()).map(([key, metadata]) => ({
        key,
        ...metadata
      }));
      
      // 排序：优先级低的、访问时间早的、体积大的优先淘汰
      cacheEntries.sort((a, b) => {
        const priorityOrder = [
          CachePriority.CRITICAL, // 最后淘汰
          CachePriority.HIGH,
          CachePriority.MEDIUM,
          CachePriority.LOW,
          CachePriority.TRANSIENT // 最先淘汰
        ];
        
        // 优先级比较
        const priorityDiff = priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        
        // 访问时间比较（最近访问的最后淘汰）
        return b.lastAccessTime - a.lastAccessTime;
      });
      
      // 开始淘汰缓存
      let freedSpace = 0;
      for (const entry of cacheEntries) {
        // 跳过关键数据，即使空间不足也不淘汰
        if (entry.priority === CachePriority.CRITICAL) continue;
        
        // 清除缓存
        CacheService.clearCache(entry.key);
        this.removeFromRegistry(entry.key);
        freedSpace += entry.size;
        this.cacheStats.evictions++;
        
        // 检查是否有足够空间
        if (this.cacheStats.usage - freedSpace + requiredSize < this.cacheStats.limit) {
          break;
        }
      }
      
      // 更新缓存使用统计
      this.cacheStats.usage -= freedSpace;
      
      log(`缓存清理完成，释放 ${this.formatSize(freedSpace)} 空间`);
      
      // 即使清理后仍不足，也要返回成功，让数据存储尝试进行
      return true;
    } catch (error) {
      log(`确保缓存空间失败: ${error}`, 'error');
      return false;
    }
  },
  
  /**
   * 获取缓存统计信息
   * @returns {Object} - 缓存统计信息
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      usagePercent: Math.round((this.cacheStats.usage / this.cacheStats.limit) * 100),
      count: this.cacheRegistry.size
    };
  },
  
  // 私有辅助方法
  
  /**
   * 更新缓存元数据
   */
  updateCacheMetadata(key, metadata) {
    this.cacheRegistry.set(key, metadata);
    this.saveCacheRegistry();
  },
  
  /**
   * 从注册表中移除项
   */
  removeFromRegistry(key) {
    const metadata = this.cacheRegistry.get(key);
    if (metadata) {
      this.cacheStats.usage -= metadata.size;
      this.cacheRegistry.delete(key);
      this.saveCacheRegistry();
    }
  },
  
  /**
   * 更新缓存统计
   */
  updateCacheStats(size, isHit) {
    if (isHit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }
    
    if (size > 0) {
      this.cacheStats.usage += size;
    }
  },
  
  /**
   * 计算数据大小
   */
  calculateDataSize(data) {
    try {
      const serialized = JSON.stringify(data);
      // 使用Blob计算字节大小
      const blob = new Blob([serialized]);
      return blob.size;
    } catch (error) {
      log(`计算数据大小失败: ${error}`, 'error');
      return 1024; // 默认1KB
    }
  },
  
  /**
   * 计算当前缓存使用情况
   */
  calculateCacheUsage() {
    let totalSize = 0;
    
    // 遍历所有缓存项计算大小
    for (const metadata of this.cacheRegistry.values()) {
      totalSize += metadata.size;
    }
    
    this.cacheStats.usage = totalSize;
  },
  
  /**
   * 加载缓存注册表
   */
  loadCacheRegistry() {
    try {
      const registryData = localStorage.getItem('advancedCacheRegistry');
      if (registryData) {
        const parsed = JSON.parse(registryData);
        this.cacheRegistry = new Map(parsed);
      }
    } catch (error) {
      log(`加载缓存注册表失败: ${error}`, 'error');
      this.cacheRegistry = new Map();
    }
  },
  
  /**
   * 保存缓存注册表
   */
  saveCacheRegistry() {
    try {
      const registryData = Array.from(this.cacheRegistry.entries());
      localStorage.setItem('advancedCacheRegistry', JSON.stringify(registryData));
    } catch (error) {
      log(`保存缓存注册表失败: ${error}`, 'error');
    }
  },
  
  /**
   * 设置定期维护任务
   */
  setupMaintenanceTasks() {
    // 每30分钟运行一次缓存维护
    const maintenanceInterval = 30 * 60 * 1000;
    
    setInterval(() => {
      try {
        // 1. 清理过期缓存
        this.cleanupExpiredCache();
        
        // 2. 如果缓存使用超过75%，清理一些低优先级缓存
        if (this.cacheStats.usage > this.cacheStats.limit * 0.75) {
          this.clearCacheBelowPriority(CachePriority.MEDIUM);
        }
        
        // 3. 记录缓存统计
        const stats = this.getCacheStats();
        log(`缓存维护完成: ${stats.count} 项, ${this.formatSize(stats.usage)}, 命中率: ${this.calculateHitRate()}%`);
      } catch (error) {
        log(`缓存维护任务失败: ${error}`, 'error');
      }
    }, maintenanceInterval);
  },
  
  /**
   * 清理过期缓存
   */
  cleanupExpiredCache() {
    try {
      let expiredCount = 0;
      
      // 检查所有缓存项
      for (const key of Array.from(this.cacheRegistry.keys())) {
        // 尝试获取缓存，会自动处理过期情况
        if (!this.getPriorityCache(key)) {
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        log(`清理过期缓存完成，共清理 ${expiredCount} 项`);
      }
    } catch (error) {
      log(`清理过期缓存失败: ${error}`, 'error');
    }
  },
  
  /**
   * 计算缓存命中率
   */
  calculateHitRate() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return total > 0 ? Math.round((this.cacheStats.hits / total) * 100) : 0;
  },
  
  /**
   * 格式化字节大小为可读格式
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// 导出默认对象
export default AdvancedCacheManager;