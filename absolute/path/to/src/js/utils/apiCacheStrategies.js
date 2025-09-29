function configureApiCacheStrategies() {
  try {
    // 为市场数据设置缓存策略 - 高优先级，较短过期时间
    AdvancedCacheManager.setStrategy('/api/market-data', {
      priority: CachePriority.HIGH,
      ttl: 60000, // 1分钟
      staleWhileRevalidate: true
    });
    
    // 为用户数据设置缓存策略 - 高优先级，较长过期时间
    AdvancedCacheManager.setStrategy('/api/user-data', {
      priority: CachePriority.HIGH,
      ttl: 300000, // 5分钟
      requireValidation: true
    });
    
    // 为静态内容设置缓存策略 - 中优先级，较长过期时间
    AdvancedCacheManager.setStrategy('/api/static-content', {
      priority: CachePriority.MEDIUM,
      ttl: 86400000, // 24小时
      storage: 'localStorage'
    });
    
    console.log('API缓存策略配置完成');
  } catch (error) {
    console.error('API缓存策略配置失败:', error);
  }
}