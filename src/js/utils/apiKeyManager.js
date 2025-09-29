/**
 * API密钥管理器 - 实现数据源API密钥的生成、存储和安全使用
 */

import { SecureStorage } from './security.js';
import { AppConfig, log } from './config.js';

// 数据源API变量名常量定义
export const DATA_SOURCE_API = {
  // 市场数据API
  MARKET_DATA: 'market_data_api',
  // 股票行情API
  STOCK_QUOTE: 'stock_quote_api',
  // 量化策略API
  QUANT_STRATEGY: 'quant_strategy_api',
  // 财务数据API
  FINANCIAL_DATA: 'financial_data_api',
  // 新闻资讯API
  NEWS_FEED: 'news_feed_api',
  // 行业研报API
  INDUSTRY_REPORT: 'industry_report_api',
  // 交易模拟API
  TRADING_SIMULATION: 'trading_simulation_api',
  // AI分析API
  AI_ANALYSIS: 'ai_analysis_api'
};

/**
 * API密钥管理器类
 * 负责生成、存储和管理API密钥
 */
export class ApiKeyManager {
  constructor() {
    // 存储密钥的命名空间前缀
    this.keyPrefix = 'haoyue_api_key_';
    // 密钥有效期（毫秒）- 设置为永久有效
    this.keyExpiry = null;
  }

  /**
   * 生成新的API密钥
   * @param {string} apiType - API类型，使用DATA_SOURCE_API中的常量
   * @returns {Promise<string>} - 返回生成的API密钥
   */
  async generateApiKey(apiType) {
    try {
      // 验证API类型是否有效
      if (!DATA_SOURCE_API[Object.keys(DATA_SOURCE_API).find(key => DATA_SOURCE_API[key] === apiType)]) {
        throw new Error(`无效的API类型: ${apiType}`);
      }

      // 生成随机密钥
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
      const apiKey = `HV-${apiType}-${timestamp}-${randomString}`.toUpperCase();
      
      // 存储密钥
      await this.storeApiKey(apiType, apiKey);
      
      log(`为API类型 ${apiType} 生成新密钥成功`);
      return apiKey;
    } catch (error) {
      log(`生成API密钥失败: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * 存储API密钥
   * @param {string} apiType - API类型
   * @param {string} apiKey - API密钥
   * @returns {Promise<boolean>} - 是否存储成功
   */
  async storeApiKey(apiType, apiKey) {
    try {
      const keyData = {
        key: apiKey,
        timestamp: Date.now(),
        expiry: this.keyExpiry,
        type: apiType
      };
      
      // 使用安全存储保存密钥
      return await SecureStorage.setItem(this.keyPrefix + apiType, keyData);
    } catch (error) {
      log(`存储API密钥失败: ${error}`, 'error');
      return false;
    }
  }

  /**
   * 获取API密钥
   * @param {string} apiType - API类型
   * @returns {Promise<string|null>} - API密钥或null（如果不存在）
   */
  async getApiKey(apiType) {
    try {
      const keyData = await SecureStorage.getItem(this.keyPrefix + apiType);
      
      if (!keyData) {
        log(`未找到API类型 ${apiType} 的密钥`);
        return null;
      }
      
      // 检查密钥是否过期（虽然我们设置为永久有效，但保留此逻辑）
      if (keyData.expiry && Date.now() > keyData.expiry) {
        log(`API类型 ${apiType} 的密钥已过期`);
        await this.removeApiKey(apiType);
        return null;
      }
      
      return keyData.key;
    } catch (error) {
      log(`获取API密钥失败: ${error}`, 'error');
      return null;
    }
  }

  /**
   * 删除API密钥
   * @param {string} apiType - API类型
   * @returns {Promise<boolean>} - 是否删除成功
   */
  async removeApiKey(apiType) {
    try {
      SecureStorage.removeItem(this.keyPrefix + apiType);
      log(`删除API类型 ${apiType} 的密钥成功`);
      return true;
    } catch (error) {
      log(`删除API密钥失败: ${error}`, 'error');
      return false;
    }
  }

  /**
   * 列出所有已存储的API密钥
   * @returns {Promise<Array>} - 密钥列表
   */
  async listApiKeys() {
    try {
      const keys = [];
      
      // 遍历所有数据源API类型
      for (const apiType of Object.values(DATA_SOURCE_API)) {
        const keyData = await SecureStorage.getItem(this.keyPrefix + apiType);
        if (keyData && (!keyData.expiry || Date.now() <= keyData.expiry)) {
          // 不返回完整密钥，只返回部分信息用于展示
          keys.push({
            type: apiType,
            key: this.maskApiKey(keyData.key),
            timestamp: keyData.timestamp,
            hasKey: !!keyData.key
          });
        }
      }
      
      return keys;
    } catch (error) {
      log(`列出API密钥失败: ${error}`, 'error');
      return [];
    }
  }

  /**
   * 掩码处理API密钥（用于安全显示）
   * @param {string} apiKey - 原始API密钥
   * @returns {string} - 掩码后的密钥
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length <= 8) return apiKey;
    
    const prefix = apiKey.substring(0, 4);
    const suffix = apiKey.substring(apiKey.length - 4);
    const maskedPart = '*'.repeat(apiKey.length - 8);
    
    return `${prefix}${maskedPart}${suffix}`;
  }

  /**
   * 为API请求添加授权头
   * @param {string} apiType - API类型
   * @param {Object} options - fetch选项
   * @returns {Promise<Object>} - 添加授权头后的fetch选项
   */
  async addAuthHeader(apiType, options = {}) {
    try {
      const apiKey = await this.getApiKey(apiType);
      
      if (!apiKey) {
        throw new Error(`未找到API类型 ${apiType} 的有效密钥`);
      }
      
      // 添加授权头
      const headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      };
      
      return {
        ...options,
        headers
      };
    } catch (error) {
      log(`添加授权头失败: ${error}`, 'error');
      throw error;
    }
  }
}

// 创建单例实例
export const apiKeyManager = new ApiKeyManager();