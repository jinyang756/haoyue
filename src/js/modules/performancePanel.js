/**
 * 性能控制面板模块 - 提供可视化的性能数据监控界面
 */

import { log } from '../utils/config.js';

/**
 * 性能控制面板类
 */
export class PerformancePanel {
  constructor() {
    // 面板配置
    this.config = {
      panelId: 'performance-panel',
      toggleKey: 'p', // 默认快捷键
      position: 'bottom-right', // 面板位置
      isVisible: false,
      refreshRate: 2000, // 数据刷新频率（毫秒）
      autoHide: false, // 自动隐藏
      autoHideDelay: 5000, // 自动隐藏延迟（毫秒）
      colors: {
        primary: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
        background: '#1a1a1a',
        text: '#ffffff',
        border: '#333333'
      },
      modules: {
        navigation: true,
        resources: true,
        apiCalls: true,
        customMetrics: true,
        systemInfo: true
      }
    };
    
    // 引用和状态
    this.panelElement = null;
    this.refreshInterval = null;
    this.hideTimeout = null;
    this.performanceMonitor = window.PerformanceMonitor || null;
    
    // 初始化面板
    this.init();
  }
  
  /**
   * 初始化性能控制面板
   */
  init() {
    try {
      // 检查性能监控工具是否可用
      if (!this.performanceMonitor) {
        log('性能监控工具不可用，无法初始化性能控制面板', 'warn');
        return false;
      }
      
      // 创建面板元素
      this.createPanelElement();
      
      // 添加事件监听
      this.addEventListeners();
      
      // 开始数据刷新
      this.startRefreshingData();
      
      // 全局暴露面板
      window.performancePanel = this;
      
      log('性能控制面板初始化成功', 'info');
      
      return true;
    } catch (error) {
      log(`性能控制面板初始化失败: ${error}`, 'error');
      return false;
    }
  }
  
  /**
   * 创建面板DOM元素
   */
  createPanelElement() {
    try {
      // 检查面板是否已存在
      if (document.getElementById(this.config.panelId)) {
        return;
      }
      
      // 创建面板容器
      this.panelElement = document.createElement('div');
      this.panelElement.id = this.config.panelId;
      this.panelElement.className = `fixed z-50 p-3 rounded-lg shadow-lg text-sm font-mono transition-all duration-300 ease-in-out select-none`;
      this.panelElement.style.background = this.config.colors.background;
      this.panelElement.style.color = this.config.colors.text;
      this.panelElement.style.border = `1px solid ${this.config.colors.border}`;
      this.panelElement.style.maxHeight = '70vh';
      this.panelElement.style.maxWidth = '90vw';
      this.panelElement.style.overflowY = 'auto';
      this.panelElement.style.fontSize = '12px';
      this.panelElement.style.display = 'none';
      
      // 设置面板位置
      this.setPanelPosition();
      
      // 创建面板头部
      const header = document.createElement('div');
      header.className = 'flex justify-between items-center mb-3 pb-2 border-b border-gray-700';
      header.innerHTML = `
        <h3 class="text-xs font-bold uppercase tracking-wider">性能监控面板</h3>
        <div class="flex gap-2">
          <button id="toggle-perf-modules" class="p-1 hover:bg-gray-800 rounded">⚙</button>
          <button id="refresh-perf-data" class="p-1 hover:bg-gray-800 rounded">🔄</button>
          <button id="close-perf-panel" class="p-1 hover:bg-gray-800 rounded">×</button>
        </div>
      `;
      
      // 创建面板内容区域
      const content = document.createElement('div');
      content.className = 'perf-content';
      
      // 创建模块容器
      const modulesContainer = document.createElement('div');
      modulesContainer.className = 'modules-container space-y-3';
      
      // 创建性能模块
      if (this.config.modules.navigation) {
        modulesContainer.appendChild(this.createNavigationModule());
      }
      
      if (this.config.modules.resources) {
        modulesContainer.appendChild(this.createResourcesModule());
      }
      
      if (this.config.modules.apiCalls) {
        modulesContainer.appendChild(this.createApiCallsModule());
      }
      
      if (this.config.modules.customMetrics) {
        modulesContainer.appendChild(this.createCustomMetricsModule());
      }
      
      if (this.config.modules.systemInfo) {
        modulesContainer.appendChild(this.createSystemInfoModule());
      }
      
      // 组装面板
      content.appendChild(modulesContainer);
      this.panelElement.appendChild(header);
      this.panelElement.appendChild(content);
      
      // 添加到文档
      document.body.appendChild(this.panelElement);
      
    } catch (error) {
      log(`创建面板元素失败: ${error}`, 'error');
    }
  }
  
  /**
   * 设置面板位置
   */
  setPanelPosition() {
    try {
      const position = this.config.position;
      const styles = {
        'top-left': { top: '10px', left: '10px' },
        'top-right': { top: '10px', right: '10px' },
        'bottom-left': { bottom: '10px', left: '10px' },
        'bottom-right': { bottom: '10px', right: '10px' }
      };
      
      const posStyles = styles[position] || styles['bottom-right'];
      Object.assign(this.panelElement.style, posStyles);
      
    } catch (error) {
      log(`设置面板位置失败: ${error}`, 'error');
    }
  }
  
  /**
   * 添加事件监听器
   */
  addEventListeners() {
    try {
      // 键盘事件 - 显示/隐藏面板
      document.addEventListener('keydown', (e) => {
        // 按下Alt+P键显示/隐藏面板
        if (e.altKey && e.key.toLowerCase() === this.config.toggleKey) {
          this.toggleVisibility();
        }
      });
      
      // 关闭按钮点击事件
      document.getElementById('close-perf-panel')?.addEventListener('click', () => {
        this.hide();
      });
      
      // 刷新按钮点击事件
      document.getElementById('refresh-perf-data')?.addEventListener('click', () => {
        this.updatePerformanceData();
      });
      
      // 设置按钮点击事件
      document.getElementById('toggle-perf-modules')?.addEventListener('click', () => {
        this.toggleModulesVisibility();
      });
      
      // 鼠标悬停事件 - 取消自动隐藏
      if (this.panelElement) {
        this.panelElement.addEventListener('mouseenter', () => {
          if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
          }
        });
        
        // 鼠标离开事件 - 触发自动隐藏
        this.panelElement.addEventListener('mouseleave', () => {
          if (this.config.autoHide) {
            this.scheduleAutoHide();
          }
        });
      }
      
    } catch (error) {
      log(`添加事件监听器失败: ${error}`, 'error');
    }
  }
  
  /**
   * 创建导航性能模块
   */
  createNavigationModule() {
    const module = document.createElement('div');
    module.className = 'perf-module border border-gray-800 rounded p-2 bg-gray-900/50';
    module.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-xs uppercase tracking-wider text-${this.getColorClass('info')}">页面导航</h4>
        <span id="nav-duration" class="text-xs">--</span>
      </div>
      <div class="grid grid-cols-2 gap-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-400">首字节时间:</span>
          <span id="nav-ttfb">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">内容加载:</span>
          <span id="nav-dom-loaded">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">页面加载:</span>
          <span id="nav-load-time">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">DNS查询:</span>
          <span id="nav-dns-time">--</span>
        </div>
      </div>
    `;
    return module;
  }
  
  /**
   * 创建资源加载模块
   */
  createResourcesModule() {
    const module = document.createElement('div');
    module.className = 'perf-module border border-gray-800 rounded p-2 bg-gray-900/50';
    module.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-xs uppercase tracking-wider text-${this.getColorClass('primary')}">资源加载</h4>
        <span id="resource-count" class="text-xs">0 资源</span>
      </div>
      <div id="resource-types" class="grid grid-cols-2 gap-1 text-xs">
        <!-- 资源类型统计将在这里动态生成 -->
      </div>
    `;
    return module;
  }
  
  /**
   * 创建API调用模块
   */
  createApiCallsModule() {
    const module = document.createElement('div');
    module.className = 'perf-module border border-gray-800 rounded p-2 bg-gray-900/50';
    module.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-xs uppercase tracking-wider text-${this.getColorClass('warning')}">API调用</h4>
        <span id="api-stats" class="text-xs">0 调用 (0% 成功)</span>
      </div>
      <div class="grid grid-cols-2 gap-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-400">平均耗时:</span>
          <span id="api-avg-time">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">最大耗时:</span>
          <span id="api-max-time">--</span>
        </div>
      </div>
      <div id="api-endpoints" class="mt-2 space-y-1 text-xs">
        <!-- API端点统计将在这里动态生成 -->
      </div>
    `;
    return module;
  }
  
  /**
   * 创建自定义指标模块
   */
  createCustomMetricsModule() {
    const module = document.createElement('div');
    module.className = 'perf-module border border-gray-800 rounded p-2 bg-gray-900/50';
    module.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-xs uppercase tracking-wider text-${this.getColorClass('primary')}">自定义指标</h4>
        <span id="custom-metrics-count" class="text-xs">0 项</span>
      </div>
      <div id="custom-metrics-list" class="space-y-1 text-xs">
        <!-- 自定义指标将在这里动态生成 -->
      </div>
    `;
    return module;
  }
  
  /**
   * 创建系统信息模块
   */
  createSystemInfoModule() {
    const module = document.createElement('div');
    module.className = 'perf-module border border-gray-800 rounded p-2 bg-gray-900/50';
    module.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-xs uppercase tracking-wider text-${this.getColorClass('info')}">系统信息</h4>
        <span id="session-id" class="text-xs hidden md:inline">--</span>
      </div>
      <div class="grid grid-cols-2 gap-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-400">会话时长:</span>
          <span id="session-duration">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">连接类型:</span>
          <span id="connection-type">--</span>
        </div>
      </div>
    `;
    return module;
  }
  
  /**
   * 开始刷新数据
   */
  startRefreshingData() {
    try {
      // 立即更新一次数据
      this.updatePerformanceData();
      
      // 设置定时器定期更新数据
      this.refreshInterval = setInterval(() => {
        // 只在面板可见时更新数据
        if (this.config.isVisible) {
          this.updatePerformanceData();
        }
      }, this.config.refreshRate);
      
    } catch (error) {
      log(`启动数据刷新失败: ${error}`, 'error');
    }
  }
  
  /**
   * 更新性能数据
   */
  updatePerformanceData() {
    try {
      if (!this.performanceMonitor || !this.panelElement) {
        return;
      }
      
      // 获取性能报告
      const report = this.performanceMonitor.getPerformanceReport();
      if (!report) {
        return;
      }
      
      // 更新导航性能数据
      this.updateNavigationData(report.navigation);
      
      // 更新资源性能数据
      this.updateResourcesData(report.resources);
      
      // 更新API调用数据
      this.updateApiCallsData(report.apiCalls);
      
      // 更新自定义指标数据
      this.updateCustomMetricsData(report.customMetrics);
      
      // 更新系统信息数据
      this.updateSystemInfoData(report);
      
    } catch (error) {
      log(`更新性能数据失败: ${error}`, 'error');
    }
  }
  
  /**
   * 更新导航性能数据
   */
  updateNavigationData(navigationData) {
    if (!navigationData) {
      return;
    }
    
    const navDuration = document.getElementById('nav-duration');
    const navTtfb = document.getElementById('nav-ttfb');
    const navDomLoaded = document.getElementById('nav-dom-loaded');
    const navLoadTime = document.getElementById('nav-load-time');
    const navDnsTime = document.getElementById('nav-dns-time');
    
    if (navDuration) {
      navDuration.textContent = `${(navigationData.loadTime / 1000).toFixed(2)}s`;
      navDuration.className = this.getDurationClass(navigationData.loadTime);
    }
    
    if (navTtfb) {
      navTtfb.textContent = `${navigationData.ttfb.toFixed(0)}ms`;
    }
    
    if (navDomLoaded) {
      navDomLoaded.textContent = `${(navigationData.domContentLoaded / 1000).toFixed(2)}s`;
    }
    
    if (navLoadTime) {
      navLoadTime.textContent = `${(navigationData.loadTime / 1000).toFixed(2)}s`;
    }
    
    if (navDnsTime) {
      navDnsTime.textContent = `${navigationData.dnsLookupTime.toFixed(0)}ms`;
    }
  }
  
  /**
   * 更新资源性能数据
   */
  updateResourcesData(resourcesData) {
    if (!resourcesData) {
      return;
    }
    
    const resourceCount = document.getElementById('resource-count');
    const resourceTypesContainer = document.getElementById('resource-types');
    
    if (resourceCount) {
      resourceCount.textContent = `${resourcesData.totalResources} 资源`;
    }
    
    if (resourceTypesContainer && resourcesData.byType) {
      // 清空容器
      resourceTypesContainer.innerHTML = '';
      
      // 生成资源类型统计
      Object.entries(resourcesData.byType).forEach(([type, metrics]) => {
        const typeElement = document.createElement('div');
        typeElement.className = 'flex justify-between';
        typeElement.innerHTML = `
          <span class="text-gray-400">${this.capitalizeFirst(type)}:</span>
          <span>${metrics.count} (${metrics.avgDuration.toFixed(0)}ms)</span>
        `;
        resourceTypesContainer.appendChild(typeElement);
      });
    }
  }
  
  /**
   * 更新API调用数据
   */
  updateApiCallsData(apiData) {
    if (!apiData) {
      return;
    }
    
    const apiStats = document.getElementById('api-stats');
    const apiAvgTime = document.getElementById('api-avg-time');
    const apiMaxTime = document.getElementById('api-max-time');
    const apiEndpointsContainer = document.getElementById('api-endpoints');
    
    if (apiStats) {
      const successRate = apiData.successRate.toFixed(0);
      apiStats.textContent = `${apiData.totalCalls} 调用 (${successRate}% 成功)`;
      apiStats.className = this.getSuccessRateClass(successRate);
    }
    
    if (apiAvgTime) {
      apiAvgTime.textContent = `${apiData.avgDuration.toFixed(0)}ms`;
    }
    
    if (apiMaxTime) {
      apiMaxTime.textContent = `${apiData.maxDuration.toFixed(0)}ms`;
    }
    
    if (apiEndpointsContainer && apiData.byUrl) {
      // 清空容器
      apiEndpointsContainer.innerHTML = '';
      
      // 获取前5个最常用的API端点
      const endpoints = Object.entries(apiData.byUrl)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);
      
      // 生成API端点统计
      endpoints.forEach(([url, metrics]) => {
        // 简化URL显示
        const simplifiedUrl = this.simplifyUrl(url);
        
        const endpointElement = document.createElement('div');
        endpointElement.className = 'text-xs text-gray-300';
        endpointElement.innerHTML = `
          <div class="flex justify-between items-center">
            <span class="truncate max-w-[150px] md:max-w-[200px]">${simplifiedUrl}</span>
            <div class="flex items-center gap-1">
              <span>${metrics.count}x</span>
              <span class="${this.getSuccessRateClass(metrics.successRate)} text-xs">${metrics.successRate.toFixed(0)}%</span>
            </div>
          </div>
          <div class="flex justify-end text-[10px] text-gray-500">
            <span>${metrics.avgDuration.toFixed(0)}ms</span>
          </div>
        `;
        apiEndpointsContainer.appendChild(endpointElement);
      });
    }
  }
  
  /**
   * 更新自定义指标数据
   */
  updateCustomMetricsData(customMetrics) {
    if (!customMetrics || Object.keys(customMetrics).length === 0) {
      return;
    }
    
    const customMetricsCount = document.getElementById('custom-metrics-count');
    const customMetricsList = document.getElementById('custom-metrics-list');
    
    if (customMetricsCount) {
      customMetricsCount.textContent = `${Object.keys(customMetrics).length} 项`;
    }
    
    if (customMetricsList) {
      // 清空容器
      customMetricsList.innerHTML = '';
      
      // 生成自定义指标列表
      Object.entries(customMetrics).forEach(([name, metrics]) => {
        const metricElement = document.createElement('div');
        metricElement.className = 'flex justify-between';
        metricElement.innerHTML = `
          <span class="text-gray-400">${this.formatMetricName(name)}:</span>
          <span>${metrics.avg.toFixed(2)}ms</span>
        `;
        customMetricsList.appendChild(metricElement);
      });
    }
  }
  
  /**
   * 更新系统信息数据
   */
  updateSystemInfoData(report) {
    const sessionId = document.getElementById('session-id');
    const sessionDuration = document.getElementById('session-duration');
    const connectionType = document.getElementById('connection-type');
    
    if (sessionId && report.sessionId) {
      sessionId.textContent = report.sessionId.substring(0, 8) + '...';
    }
    
    if (sessionDuration && report.duration) {
      const durationInSeconds = report.duration / 1000;
      let durationText;
      
      if (durationInSeconds < 60) {
        durationText = `${durationInSeconds.toFixed(0)}s`;
      } else {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        durationText = `${minutes}m${seconds}s`;
      }
      
      sessionDuration.textContent = durationText;
    }
    
    if (connectionType && report.connection) {
      const effectiveType = report.connection.effectiveType || 'unknown';
      connectionType.textContent = effectiveType.toUpperCase();
    }
  }
  
  /**
   * 切换面板可见性
   */
  toggleVisibility() {
    try {
      if (!this.panelElement) {
        return;
      }
      
      if (this.config.isVisible) {
        this.hide();
      } else {
        this.show();
      }
      
    } catch (error) {
      log(`切换面板可见性失败: ${error}`, 'error');
    }
  }
  
  /**
   * 显示面板
   */
  show() {
    try {
      if (!this.panelElement) {
        return;
      }
      
      this.panelElement.style.display = 'block';
      this.config.isVisible = true;
      
      // 立即更新数据
      this.updatePerformanceData();
      
      // 如果启用了自动隐藏，设置自动隐藏计时器
      if (this.config.autoHide) {
        this.scheduleAutoHide();
      }
      
    } catch (error) {
      log(`显示面板失败: ${error}`, 'error');
    }
  }
  
  /**
   * 隐藏面板
   */
  hide() {
    try {
      if (!this.panelElement) {
        return;
      }
      
      this.panelElement.style.display = 'none';
      this.config.isVisible = false;
      
      // 清除自动隐藏计时器
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      
    } catch (error) {
      log(`隐藏面板失败: ${error}`, 'error');
    }
  }
  
  /**
   * 安排自动隐藏
   */
  scheduleAutoHide() {
    try {
      // 清除现有的计时器
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
      
      // 设置新的计时器
      this.hideTimeout = setTimeout(() => {
        if (this.config.isVisible) {
          this.hide();
        }
      }, this.config.autoHideDelay);
      
    } catch (error) {
      log(`安排自动隐藏失败: ${error}`, 'error');
    }
  }
  
  /**
   * 切换模块可见性
   */
  toggleModulesVisibility() {
    try {
      // 这里可以实现一个简单的配置菜单
      // 简化实现：循环切换各个模块的可见性
      const modules = document.querySelectorAll('.perf-module');
      let allVisible = true;
      
      // 检查是否所有模块都可见
      modules.forEach(module => {
        if (module.style.display === 'none') {
          allVisible = false;
        }
      });
      
      // 如果所有模块都可见，则隐藏一半；否则显示所有模块
      const newDisplay = allVisible ? 'none' : 'block';
      const startIndex = allVisible ? modules.length % 2 : 0;
      
      modules.forEach((module, index) => {
        if (allVisible) {
          // 隐藏奇数位置的模块
          if (index % 2 === startIndex) {
            module.style.display = newDisplay;
          }
        } else {
          // 显示所有模块
          module.style.display = newDisplay;
        }
      });
      
    } catch (error) {
      log(`切换模块可见性失败: ${error}`, 'error');
    }
  }
  
  /**
   * 获取持续时间对应的样式类
   */
  getDurationClass(duration) {
    if (duration < 1000) return 'text-green-400';
    if (duration < 3000) return 'text-yellow-400';
    return 'text-red-400';
  }
  
  /**
   * 获取成功率对应的样式类
   */
  getSuccessRateClass(successRate) {
    if (typeof successRate === 'string') {
      successRate = parseInt(successRate);
    }
    
    if (successRate >= 90) return 'text-green-400';
    if (successRate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  }
  
  /**
   * 获取颜色对应的类名
   */
  getColorClass(colorName) {
    const colorMap = {
      primary: 'green-400',
      warning: 'yellow-400',
      error: 'red-400',
      info: 'blue-400'
    };
    
    return colorMap[colorName] || 'white';
  }
  
  /**
   * 首字母大写
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * 简化URL显示
   */
  simplifyUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      let simplified = urlObj.pathname;
      
      // 如果URL是API请求，尝试提取更有意义的部分
      if (simplified.includes('/api/')) {
        const parts = simplified.split('/');
        const apiIndex = parts.indexOf('api');
        if (apiIndex !== -1 && parts.length > apiIndex + 1) {
          simplified = parts.slice(apiIndex, apiIndex + 3).join('/');
        }
      }
      
      // 限制长度
      if (simplified.length > 30) {
        simplified = simplified.substring(0, 27) + '...';
      }
      
      return simplified;
    } catch (error) {
      // 如果URL解析失败，返回原始URL的前30个字符
      return url.substring(0, 30) + (url.length > 30 ? '...' : '');
    }
  }
  
  /**
   * 格式化指标名称
   */
  formatMetricName(name) {
    // 替换下划线和破折号为空格
    const formatted = name.replace(/[_-]/g, ' ');
    // 首字母大写
    return this.capitalizeFirst(formatted);
  }
  
  /**
   * 导出性能数据
   */
  exportPerformanceData() {
    try {
      if (!this.performanceMonitor) {
        return null;
      }
      
      const report = this.performanceMonitor.getPerformanceReport();
      if (!report) {
        return null;
      }
      
      // 转换为JSON字符串
      const dataStr = JSON.stringify(report, null, 2);
      
      // 创建Blob对象
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-report-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return report;
    } catch (error) {
      log(`导出性能数据失败: ${error}`, 'error');
      return null;
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    try {
      // 清除定时器
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      
      // 移除面板元素
      if (this.panelElement && this.panelElement.parentNode) {
        this.panelElement.parentNode.removeChild(this.panelElement);
        this.panelElement = null;
      }
      
      // 清除全局引用
      delete window.performancePanel;
      
      log('性能控制面板资源已清理', 'info');
    } catch (error) {
      log(`清理性能控制面板资源失败: ${error}`, 'error');
    }
  }
}

// 导出默认实例创建函数
export function initPerformancePanel() {
  try {
    const panel = new PerformancePanel();
    return panel;
  } catch (error) {
    log(`初始化性能控制面板失败: ${error}`, 'error');
    return null;
  }
}

// 默认导出
export default PerformancePanel;