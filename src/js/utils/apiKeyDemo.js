/**
 * API密钥管理器使用示例
 * 此文件展示如何使用ApiKeyManager类来管理和使用API密钥
 */

// 导入API密钥管理器
import { apiKeyManager, DATA_SOURCE_API } from './apiKeyManager.js';

/**
 * 初始化API密钥管理器
 * 在应用启动时调用此函数进行初始化
 */
export async function initializeApiKeyManager() {
  try {
    // 初始化密钥管理器
    await apiKeyManager.initialize();
    console.log('API密钥管理器初始化成功');
    
    // 检查是否有保存的密钥
    const hasKeys = await apiKeyManager.hasAnyKeys();
    if (hasKeys) {
      console.log('检测到已保存的API密钥');
      
      // 列出已保存的API类型
      const savedTypes = await apiKeyManager.getSavedApiTypes();
      console.log('已保存的API类型:', savedTypes);
    } else {
      console.log('未检测到保存的API密钥，请生成或添加密钥');
    }
  } catch (error) {
    console.error('API密钥管理器初始化失败:', error);
  }
}

/**
 * 生成并保存新的API密钥
 * @param {string} apiType - API类型，使用DATA_SOURCE_API中的常量
 * @returns {Promise<string>} - 返回生成的密钥
 */
export async function generateAndSaveApiKey(apiType) {
  try {
    // 验证API类型是否有效
    if (!Object.values(DATA_SOURCE_API).includes(apiType)) {
      throw new Error(`无效的API类型: ${apiType}`);
    }
    
    // 生成新的API密钥
    const apiKey = await apiKeyManager.generateApiKey(apiType);
    
    // 保存API密钥（实际应用中，用户应该复制此密钥并保存在安全的地方）
    await apiKeyManager.saveApiKey(apiType, apiKey);
    
    console.log(`${apiType} API密钥生成并保存成功`);
    console.log('请注意：此密钥仅显示一次，请妥善保存！');
    
    return apiKey;
  } catch (error) {
    console.error(`生成${apiType} API密钥失败:`, error);
    throw error;
  }
}

/**
 * 手动添加API密钥
 * @param {string} apiType - API类型
 * @param {string} apiKey - 用户手动输入的API密钥
 */
export async function addApiKeyManually(apiType, apiKey) {
  try {
    // 验证API类型是否有效
    if (!Object.values(DATA_SOURCE_API).includes(apiType)) {
      throw new Error(`无效的API类型: ${apiType}`);
    }
    
    // 验证API密钥格式（实际应用中可以根据具体需求进行更严格的验证）
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('API密钥不能为空');
    }
    
    // 保存API密钥
    await apiKeyManager.saveApiKey(apiType, apiKey.trim());
    
    console.log(`${apiType} API密钥手动添加成功`);
  } catch (error) {
    console.error(`手动添加${apiType} API密钥失败:`, error);
    throw error;
  }
}

/**
 * 使用API密钥发送请求示例
 * @param {string} apiType - API类型
 * @param {string} endpoint - API端点
 */
export async function fetchWithApiKey(apiType, endpoint) {
  try {
    // 确保API类型有效
    if (!Object.values(DATA_SOURCE_API).includes(apiType)) {
      throw new Error(`无效的API类型: ${apiType}`);
    }
    
    // 构建完整的API URL
    const baseUrl = 'https://api.example.com'; // 实际应用中应从配置获取
    const url = `${baseUrl}${endpoint}`;
    
    // 使用带有API密钥的fetchWithCache函数
    const { fetchWithCache } = await import('./cacheService.js');
    const data = await fetchWithCache(url, {}, null, 5, apiType);
    
    console.log(`使用${apiType} API密钥请求成功，响应数据:`, data);
    return data;
  } catch (error) {
    console.error(`使用${apiType} API密钥请求失败:`, error);
    throw error;
  }
}

/**
 * 获取所有数据源API信息
 * @returns {Object} - 返回所有数据源API的常量信息
 */
export function getAvailableDataSources() {
  return {
    dataSources: DATA_SOURCE_API,
    description: '以下是可用的数据源API类型，每个类型对应一个可调用的数据服务：',
    details: {
      [DATA_SOURCE_API.MARKET_DATA]: '市场数据API - 获取金融市场的实时和历史数据',
      [DATA_SOURCE_API.STOCK_QUOTE]: '股票报价API - 获取股票的实时报价和交易信息',
      [DATA_SOURCE_API.NEWS_FEED]: '新闻资讯API - 获取最新的财经新闻和市场分析',
      [DATA_SOURCE_API.INDUSTRY_REPORT]: '行业报告API - 获取各行业的深度研究报告',
      [DATA_SOURCE_API.COMPANY_PROFILE]: '公司简介API - 获取公司的详细信息和财务概况',
      [DATA_SOURCE_API.FINANCIAL_STATEMENT]: '财务报表API - 获取公司的财务报表数据',
      [DATA_SOURCE_API.ECONOMIC_INDICATOR]: '经济指标API - 获取宏观经济指标数据',
      [DATA_SOURCE_API.TECHNICAL_ANALYSIS]: '技术分析API - 获取股票和市场的技术分析数据'
    },
    note: '密钥生成后请妥善保存，一旦丢失需要重新生成'
  };
}

/**
 * 演示API密钥管理器的完整使用流程
 */
export async function demonstrateApiKeyManagement() {
  try {
    console.log('=== API密钥管理器演示开始 ===');
    
    // 1. 初始化
    await initializeApiKeyManager();
    
    // 2. 显示可用数据源
    const dataSources = getAvailableDataSources();
    console.log('\n可用的数据源API:');
    Object.entries(dataSources.details).forEach(([type, desc]) => {
      console.log(`- ${type}: ${desc}`);
    });
    
    // 3. 示例：生成并保存一个API密钥
    const apiType = DATA_SOURCE_API.MARKET_DATA;
    console.log(`\n示例：生成并保存${apiType} API密钥`);
    
    try {
      // 在实际应用中，这一步通常由用户触发
      const apiKey = await generateAndSaveApiKey(apiType);
      console.log(`生成的${apiType} API密钥: ${apiKey}`);
      console.log('提示：在实际应用中，此处应仅显示密钥一次，并提示用户妥善保存');
    } catch (error) {
      console.log('跳过密钥生成演示');
    }
    
    // 4. 示例：使用API密钥发送请求
    console.log(`\n示例：使用${apiType} API密钥发送请求`);
    
    try {
      // 在实际应用中，这里会是真实的API调用
      // 由于是演示，我们只是模拟这个过程
      console.log(`假设我们向https://api.example.com/market-data发送了请求，并成功添加了API密钥授权头`);
    } catch (error) {
      console.log('跳过API请求演示');
    }
    
    // 5. 显示保存的密钥信息
    const savedTypes = await apiKeyManager.getSavedApiTypes();
    console.log(`\n当前已保存的API密钥类型: ${savedTypes.join(', ') || '无'}`);
    
    console.log('\n=== API密钥管理器演示结束 ===');
    console.log('注意：密钥可以永久调用，但获取后不保存好就会丢失，需要重新获取');
  } catch (error) {
    console.error('API密钥管理器演示失败:', error);
  }
}