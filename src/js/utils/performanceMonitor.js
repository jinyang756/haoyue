/**
 * 性能监控工具 - 提供页面性能、资源加载、API调用等性能指标的监控和分析功能
 */

import { AppConfig, log } from './config.js';

/**
 * 性能监控类
 */
export const PerformanceMonitor = {
  // 性能数据存储
  performanceData: {
    navigationEntries: [],
    resourceEntries: [],
    apiCalls: [],
    customMetrics: {},
    startTime: performance.now(),
    sessionId: generateSessionId()
  },
  
  // 性能标记点
  markers: new Map(),
  
  // 性能观察器
  observers: {
    resource: null,
    navigation: null,
    longtask: null,
    paint: null
  },
  
  // 配置项
  config: {
    enabled: true,
    samplingRate: 1.0, // 采样率 (0-1)
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    maxEntries: 100, // 最大存储条目数
    sendToServer: false, // 默认不发送到服务器
    serverUrl: '/api/performance-metrics' // 默认服务器端点
  },
  
  /**
   * 初始化性能监控
   */
  init() {
    try {
      // 检查浏览器支持
      if (!this.isSupported()) {
        log('性能监控不支持当前浏览器环境', 'warn');
        return false;
      }
      
      // 如果禁用了性能监控，直接返回
      if (!this.config.enabled) {
        log('性能监控已禁用', 'info');
        return false;
      }
      
      // 采样控制
      if (Math.random() > this.config.samplingRate) {
        log('性能监控采样未命中', 'debug');
        return false;
      }
      
      log('初始化性能监控...', 'info');
      
      // 初始化性能观察器
      this.initObservers();
      
      // 记录页面导航性能
      this.recordNavigationPerformance();
      
      // 记录初始资源加载性能
      this.recordInitialResourcePerformance();
      
      // 设置全局性能监控API
      this.setupGlobalAPI();
      
      // 添加页面卸载事件监听，发送性能数据
      this.setupPageUnloadHandler();
      
      log('性能监控初始化完成', 'info');
      
      return true;
    } catch (error) {
      log(`性能监控初始化失败: ${error}`, 'error');
      return false;
    }
  },
  
  /**
   * 检查浏览器是否支持性能监控
   */
  isSupported() {
    return typeof window !== 'undefined' && 
           'performance' in window && 
           'getEntriesByType' in performance && 
           ('PerformanceObserver' in window || 'webkitPerformanceObserver' in window);
  },
  
  /**
   * 初始化性能观察器
   */
  initObservers() {
    const PerformanceObserver = window.PerformanceObserver || window.webkitPerformanceObserver;
    
    // 资源加载监控
    try {
      this.observers.resource = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handleResourceEntry(entry);
        });
      });
      this.observers.resource.observe({ entryTypes: ['resource'], buffered: true });
    } catch (error) {
      log(`资源性能观察器初始化失败: ${error}`, 'error');
    }
    
    // 页面导航监控
    try {
      this.observers.navigation = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handleNavigationEntry(entry);
        });
      });
      this.observers.navigation.observe({ entryTypes: ['navigation'], buffered: true });
    } catch (error) {
      log(`导航性能观察器初始化失败: ${error}`, 'error');
    }
    
    // 长任务监控
    try {
      this.observers.longtask = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handleLongTaskEntry(entry);
        });
      });
      this.observers.longtask.observe({ entryTypes: ['longtask'], buffered: true });
    } catch (error) {
      log(`长任务观察器初始化失败: ${error}`, 'error');
    }
    
    // 绘制性能监控
    try {
      this.observers.paint = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handlePaintEntry(entry);
        });
      });
      this.observers.paint.observe({ entryTypes: ['paint'], buffered: true });
    } catch (error) {
      log(`绘制性能观察器初始化失败: ${error}`, 'error');
    }
  },
  
  /**
   * 记录页面导航性能
   */
  recordNavigationPerformance() {
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        this.performanceData.navigationEntries = navEntries;
        this.logNavigationMetrics(navEntries[0]);
      }
    } catch (error) {
      log(`记录导航性能失败: ${error}`, 'error');
    }
  },
  
  /**
   * 记录初始资源加载性能
   */
  recordInitialResourcePerformance() {
    try {
      const resourceEntries = performance.getEntriesByType('resource');
      resourceEntries.forEach((entry) => {
        this.handleResourceEntry(entry);
      });
    } catch (error) {
      log(`记录初始资源性能失败: ${error}`, 'error');
    }
  },
  
  /**
   * 处理资源加载条目
   */
  handleResourceEntry(entry) {
    try {
      // 过滤不需要监控的资源
      if (this.shouldFilterResource(entry)) {
        return;
      }
      
      // 添加到资源性能数据
      this.performanceData.resourceEntries.push(entry);
      
      // 确保条目数不超过最大限制
      this.trimEntries(this.performanceData.resourceEntries);
      
      // 日志记录
      this.logResourceMetrics(entry);
      
    } catch (error) {
      log(`处理资源性能条目失败: ${error}`, 'error');
    }
  },
  
  /**
   * 处理导航性能条目
   */
  handleNavigationEntry(entry) {
    try {
      this.performanceData.navigationEntries.push(entry);
      this.logNavigationMetrics(entry);
    } catch (error) {
      log(`处理导航性能条目失败: ${error}`, 'error');
    }
  },
  
  /**
   * 处理长任务条目
   */
  handleLongTaskEntry(entry) {
    try {
      // 长任务通常是阻塞主线程50ms以上的任务
      if (this.config.logLevel === 'debug') {
        log(`检测到长任务: ${entry.duration.toFixed(2)}ms`, 'debug');
      }
      
      // 可以在这里添加长任务的具体处理逻辑
    } catch (error) {
      log(`处理长任务条目失败: ${error}`, 'error');
    }
  },
  
  /**
   * 处理绘制性能条目
   */
  handlePaintEntry(entry) {
    try {
      // 记录首屏绘制时间(FCP)和最大内容绘制时间(LCP)
      if (entry.name === 'first-contentful-paint') {
        this.setCustomMetric('fcp', entry.startTime);
        log(`首屏绘制时间(FCP): ${entry.startTime.toFixed(2)}ms`, 'info');
      }
      
      // 可以在这里处理其他绘制相关指标
    } catch (error) {
      log(`处理绘制性能条目失败: ${error}`, 'error');
    }
  },
  
  /**
   * 设置全局性能监控API
   */
  setupGlobalAPI() {
    try {
      // 全局暴露性能监控工具
      window.PerformanceMonitor = this;
      
      // 简化的全局标记API
      window.markPerformance = (name) => this.mark(name);
      window.measurePerformance = (name, startMark, endMark) => this.measure(name, startMark, endMark);
      window.monitorApiCall = (url, startTime, endTime, success) => this.monitorApiCall(url, startTime, endTime, success);
    } catch (error) {
      log(`设置全局API失败: ${error}`, 'error');
    }
  },
  
  /**
   * 设置页面卸载处理程序
   */
  setupPageUnloadHandler() {
    try {
      // 在页面卸载时发送性能数据
      window.addEventListener('beforeunload', () => {
        if (this.config.sendToServer) {
          this.sendPerformanceData();
        }
      }, false);
      
      // 对于SPA应用，监听路由变化
      window.addEventListener('popstate', () => {
        if (this.config.sendToServer) {
          // 延迟发送，避免影响页面切换性能
          setTimeout(() => this.sendPerformanceData(), 1000);
        }
      }, false);
    } catch (error) {
      log(`设置页面卸载处理程序失败: ${error}`, 'error');
    }
  },
  
  /**
   * 创建性能标记
   */
  mark(name) {
    try {
      const fullName = `${this.performanceData.sessionId}_${name}`;
      performance.mark(fullName);
      this.markers.set(name, fullName);
      return fullName;
    } catch (error) {
      log(`创建性能标记失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 测量两个标记之间的时间差
   */
  measure(name, startMark, endMark) {
    try {
      const startMarkName = this.markers.get(startMark) || startMark;
      const endMarkName = endMark ? (this.markers.get(endMark) || endMark) : undefined;
      
      let measureName = `${this.performanceData.sessionId}_${name}`;
      
      // 如果没有提供结束标记，使用当前时间
      if (!endMarkName) {
        performance.measure(measureName, startMarkName);
      } else {
        performance.measure(measureName, startMarkName, endMarkName);
      }
      
      // 获取测量结果
      const measures = performance.getEntriesByName(measureName);
      if (measures.length > 0) {
        const measure = measures[0];
        const duration = measure.duration;
        
        // 记录自定义指标
        this.setCustomMetric(name, duration);
        
        log(`性能测量 [${name}]: ${duration.toFixed(2)}ms`, 'debug');
        
        return duration;
      }
      
      return 0;
    } catch (error) {
      log(`性能测量失败: ${error}`, 'error');
      return 0;
    }
  },
  
  /**
   * 监控API调用性能
   */
  monitorApiCall(url, startTime, endTime, success = true) {
    try {
      const duration = endTime - startTime;
      
      const apiCall = {
        url,
        duration,
        startTime,
        endTime,
        success,
        timestamp: Date.now()
      };
      
      this.performanceData.apiCalls.push(apiCall);
      
      // 确保条目数不超过最大限制
      this.trimEntries(this.performanceData.apiCalls);
      
      // 日志记录
      if (this.config.logLevel === 'debug') {
        log(`API调用 [${url}]: ${duration.toFixed(2)}ms, 状态: ${success ? '成功' : '失败'}`, 'debug');
      }
      
      // 如果调用时间过长，记录警告
      if (duration > 2000) {
        log(`API调用超时 [${url}]: ${duration.toFixed(2)}ms`, 'warn');
      }
      
    } catch (error) {
      log(`监控API调用失败: ${error}`, 'error');
    }
  },
  
  /**
   * 设置自定义性能指标
   */
  setCustomMetric(name, value) {
    try {
      if (!this.performanceData.customMetrics[name]) {
        this.performanceData.customMetrics[name] = [];
      }
      
      this.performanceData.customMetrics[name].push({
        value,
        timestamp: Date.now()
      });
      
      // 确保每个指标的条目数不超过最大限制的一半
      this.trimEntries(this.performanceData.customMetrics[name], this.config.maxEntries / 2);
      
    } catch (error) {
      log(`设置自定义指标失败: ${error}`, 'error');
    }
  },
  
  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    try {
      const report = {
        sessionId: this.performanceData.sessionId,
        startTime: this.performanceData.startTime,
        currentTime: performance.now(),
        duration: performance.now() - this.performanceData.startTime,
        navigation: this.summarizeNavigationMetrics(),
        resources: this.summarizeResourceMetrics(),
        apiCalls: this.summarizeApiMetrics(),
        customMetrics: this.summarizeCustomMetrics(),
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth
        },
        connection: navigator.connection ? {
          type: navigator.connection.type,
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink
        } : null
      };
      
      return report;
    } catch (error) {
      log(`生成性能报告失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 发送性能数据到服务器
   */
  sendPerformanceData() {
    try {
      if (!this.config.sendToServer) {
        return false;
      }
      
      const report = this.getPerformanceReport();
      if (!report) {
        return false;
      }
      
      // 使用navigator.sendBeacon确保数据能在页面卸载时发送
      if ('sendBeacon' in navigator) {
        const data = new Blob([JSON.stringify(report)], { type: 'application/json' });
        navigator.sendBeacon(this.config.serverUrl, data);
        log('性能数据已发送到服务器', 'info');
        return true;
      } else {
        // 降级方案
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.config.serverUrl, false); // 同步发送
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(report));
        log('性能数据已通过XHR发送到服务器', 'info');
        return true;
      }
    } catch (error) {
      log(`发送性能数据失败: ${error}`, 'error');
      return false;
    }
  },
  
  /**
   * 过滤不需要监控的资源
   */
  shouldFilterResource(entry) {
    // 可以根据需要添加过滤规则
    const excludedTypes = ['image', 'font'];
    const excludedDomains = [];
    
    return excludedTypes.includes(entry.initiatorType) ||
           excludedDomains.some(domain => entry.name.includes(domain));
  },
  
  /**
   * 限制条目数量
   */
  trimEntries(entries, maxLength = this.config.maxEntries) {
    while (entries.length > maxLength) {
      entries.shift(); // 移除最早的条目
    }
  },
  
  /**
   * 统计导航性能指标
   */
  summarizeNavigationMetrics() {
    try {
      if (this.performanceData.navigationEntries.length === 0) {
        return null;
      }
      
      const entry = this.performanceData.navigationEntries[0];
      
      return {
        // DNS查询耗时
        dnsLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
        // TCP连接耗时
        tcpConnectionTime: entry.connectEnd - entry.connectStart,
        // SSL握手耗时
        sslHandshakeTime: entry.secureConnectionStart > 0 ? 
          (entry.connectEnd - entry.secureConnectionStart) : 0,
        // 首字节时间
        ttfb: entry.responseStart - entry.navigationStart,
        // 内容加载完成时间
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
        // 页面完全加载时间
        loadTime: entry.loadEventEnd - entry.navigationStart,
        // 重定向次数
        redirectCount: entry.redirectCount,
        // 重定向耗时
        redirectTime: entry.redirectEnd - entry.redirectStart
      };
    } catch (error) {
      log(`统计导航指标失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 统计资源性能指标
   */
  summarizeResourceMetrics() {
    try {
      const resourcesByType = {};
      
      this.performanceData.resourceEntries.forEach(entry => {
        const type = entry.initiatorType || 'other';
        
        if (!resourcesByType[type]) {
          resourcesByType[type] = {
            count: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0
          };
        }
        
        const metrics = resourcesByType[type];
        metrics.count++;
        metrics.totalDuration += entry.duration;
        metrics.minDuration = Math.min(metrics.minDuration, entry.duration);
        metrics.maxDuration = Math.max(metrics.maxDuration, entry.duration);
      });
      
      // 计算平均值
      Object.keys(resourcesByType).forEach(type => {
        const metrics = resourcesByType[type];
        metrics.avgDuration = metrics.totalDuration / metrics.count;
      });
      
      return {
        totalResources: this.performanceData.resourceEntries.length,
        byType: resourcesByType
      };
    } catch (error) {
      log(`统计资源指标失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 统计API调用性能指标
   */
  summarizeApiMetrics() {
    try {
      const successCalls = this.performanceData.apiCalls.filter(call => call.success);
      const failedCalls = this.performanceData.apiCalls.filter(call => !call.success);
      
      const avgDuration = successCalls.length > 0 ? 
        (successCalls.reduce((sum, call) => sum + call.duration, 0) / successCalls.length) : 0;
      
      const maxDuration = successCalls.length > 0 ? 
        Math.max(...successCalls.map(call => call.duration)) : 0;
      
      const minDuration = successCalls.length > 0 ? 
        Math.min(...successCalls.map(call => call.duration)) : 0;
      
      // 按URL分组统计
      const byUrl = {};
      this.performanceData.apiCalls.forEach(call => {
        if (!byUrl[call.url]) {
          byUrl[call.url] = {
            count: 0,
            successCount: 0,
            totalDuration: 0
          };
        }
        
        const metrics = byUrl[call.url];
        metrics.count++;
        if (call.success) {
          metrics.successCount++;
          metrics.totalDuration += call.duration;
        }
      });
      
      // 计算每个URL的平均耗时和成功率
      Object.keys(byUrl).forEach(url => {
        const metrics = byUrl[url];
        metrics.avgDuration = metrics.successCount > 0 ? 
          (metrics.totalDuration / metrics.successCount) : 0;
        metrics.successRate = (metrics.successCount / metrics.count) * 100;
      });
      
      return {
        totalCalls: this.performanceData.apiCalls.length,
        successCalls: successCalls.length,
        failedCalls: failedCalls.length,
        successRate: this.performanceData.apiCalls.length > 0 ? 
          (successCalls.length / this.performanceData.apiCalls.length) * 100 : 0,
        avgDuration,
        maxDuration,
        minDuration,
        byUrl
      };
    } catch (error) {
      log(`统计API指标失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 统计自定义性能指标
   */
  summarizeCustomMetrics() {
    try {
      const summary = {};
      
      Object.keys(this.performanceData.customMetrics).forEach(name => {
        const metrics = this.performanceData.customMetrics[name];
        const values = metrics.map(m => m.value);
        
        summary[name] = {
          count: metrics.length,
          avg: values.length > 0 ? (values.reduce((sum, val) => sum + val, 0) / values.length) : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
          // 只保留最近的10个值
          recentValues: values.slice(-10)
        };
      });
      
      return summary;
    } catch (error) {
      log(`统计自定义指标失败: ${error}`, 'error');
      return null;
    }
  },
  
  /**
   * 记录导航性能日志
   */
  logNavigationMetrics(entry) {
    try {
      if (this.config.logLevel !== 'debug' && this.config.logLevel !== 'info') {
        return;
      }
      
      const metrics = this.summarizeNavigationMetrics();
      if (!metrics) {
        return;
      }
      
      log(`导航性能指标: 首字节时间=${metrics.ttfb.toFixed(2)}ms, 内容加载=${metrics.domContentLoaded.toFixed(2)}ms, 页面加载=${metrics.loadTime.toFixed(2)}ms`, 'info');
    } catch (error) {
      log(`记录导航日志失败: ${error}`, 'error');
    }
  },
  
  /**
   * 记录资源性能日志
   */
  logResourceMetrics(entry) {
    try {
      if (this.config.logLevel !== 'debug') {
        return;
      }
      
      // 只记录耗时较长的资源
      if (entry.duration > 1000) {
        log(`资源加载较慢 [${entry.initiatorType}] ${entry.name}: ${entry.duration.toFixed(2)}ms`, 'warn');
      } else if (this.config.logLevel === 'debug') {
        log(`资源加载 [${entry.initiatorType}] ${entry.name}: ${entry.duration.toFixed(2)}ms`, 'debug');
      }
    } catch (error) {
      log(`记录资源日志失败: ${error}`, 'error');
    }
  },
  
  /**
   * 清理性能监控资源
   */
  cleanup() {
    try {
      // 断开所有观察器连接
      Object.values(this.observers).forEach(observer => {
        if (observer) {
          observer.disconnect();
        }
      });
      
      // 清除全局引用
      delete window.PerformanceMonitor;
      delete window.markPerformance;
      delete window.measurePerformance;
      delete window.monitorApiCall;
      
      log('性能监控资源已清理', 'info');
    } catch (error) {
      log(`清理性能监控资源失败: ${error}`, 'error');
    }
  }
};

/**
 * 生成会话ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 导出默认对象
export default PerformanceMonitor;