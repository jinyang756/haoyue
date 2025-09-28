/**
 * 管理员面板页面模块 - 实现系统管理和数据监控功能
 */

/**
 * 初始化管理员面板页面
 */
export function initAdminPanel() {
  console.log('管理员面板模块已加载');
  
  // 检查管理员权限
  if (!checkAdminPermission()) {
    navigateTo('home');
    return;
  }
  
  // 初始化管理员导航
  initAdminNavigation();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化数据概览图表
  initAdminCharts();
  
  // 初始化用户管理表格
  initUserManagementTable();
  
  // 初始化系统日志功能
  initSystemLogs();
  
  // 初始化数据刷新功能
  initDataRefresh();
}

/**
 * 检查管理员权限
 */
function checkAdminPermission() {
  // 从authModule中获取登录状态
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
  return isAdmin;
}

/**
 * 初始化管理员导航
 */
function initAdminNavigation() {
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminContents = document.querySelectorAll('.admin-content-section');
  
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      // 更新标签状态
      adminTabs.forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white');
        t.classList.add('bg-gray-100', 'text-gray-800');
      });
      tab.classList.remove('bg-gray-100', 'text-gray-800');
      tab.classList.add('bg-blue-600', 'text-white');
      
      // 更新内容显示
      adminContents.forEach(content => {
        content.classList.add('hidden');
        if (content.id === `${tabId}-content`) {
          content.classList.remove('hidden');
          // 添加内容动画
          animateAdminContent(content);
        }
      });
    });
  });
  
  // 默认显示第一个标签
  if (adminTabs.length > 0) {
    adminTabs[0].click();
  }
}

/**
 * 管理员内容动画
 */
function animateAdminContent(content) {
  const elements = content.querySelectorAll('.animate-on-admin-tab');
  elements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 80 * index);
  });
}

/**
 * 初始化数据概览图表
 */
function initAdminCharts() {
  // 使用setTimeout确保DOM元素已加载
  setTimeout(() => {
    try {
      // 初始化用户增长图表
      initUserGrowthChart();
      
      // 初始化API调用统计图表
      initApiCallsChart();
    } catch (error) {
      console.error('初始化管理图表失败:', error);
    }
  }, 100);
}

/**
 * 初始化用户增长图表
 */
function initUserGrowthChart() {
  const userChartCanvas = document.getElementById('user-growth-chart');
  if (userChartCanvas && typeof Chart !== 'undefined') {
    try {
      // 生成模拟数据
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const newUsers = [23, 45, 67, 98, 120, 156, 189, 234, 289, 320, 356, 400];
      const activeUsers = [10, 25, 40, 70, 100, 130, 160, 200, 240, 270, 300, 330];
      
      new Chart(userChartCanvas, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: '新增用户',
              data: newUsers,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              tension: 0.3,
              fill: true
            },
            {
              label: '活跃用户',
              data: activeUsers,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('创建用户增长图表失败:', error);
    }
  }
}

/**
 * 初始化API调用统计图表
 */
function initApiCallsChart() {
  const apiChartCanvas = document.getElementById('api-calls-chart');
  if (apiChartCanvas && typeof Chart !== 'undefined') {
    try {
      // 生成模拟数据
      const apiTypes = ['市场指数', '股票搜索', '量化策略', '用户数据', '系统配置'];
      const callCounts = [1258, 987, 654, 320, 156];
      const errorCounts = [12, 8, 5, 3, 1];
      
      new Chart(apiChartCanvas, {
        type: 'bar',
        data: {
          labels: apiTypes,
          datasets: [
            {
              label: '调用次数',
              data: callCounts,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            },
            {
              label: '错误次数',
              data: errorCounts,
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('创建API调用图表失败:', error);
    }
  }
}

/**
 * 初始化用户管理表格
 */
function initUserManagementTable() {
  const userTable = document.getElementById('user-management-table');
  if (userTable) {
    const tableBody = userTable.querySelector('tbody');
    if (tableBody) {
      // 模拟加载用户数据
      loadUserManagementData(tableBody);
      
      // 添加搜索功能
      initUserSearch();
      
      // 添加用户状态切换功能
      initUserStatusToggle();
      
      // 添加用户删除功能
      initUserDelete();
    }
  }
}

/**
 * 加载用户管理数据
 */
function loadUserManagementData(tableBody) {
  // 模拟用户数据
  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', role: '管理员', status: '活跃', registrationDate: '2023-01-01', lastLogin: '2023-09-27 14:30' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: '普通用户', status: '活跃', registrationDate: '2023-02-15', lastLogin: '2023-09-26 09:15' },
    { id: 3, username: 'user2', email: 'user2@example.com', role: '普通用户', status: '活跃', registrationDate: '2023-03-20', lastLogin: '2023-09-25 16:45' },
    { id: 4, username: 'user3', email: 'user3@example.com', role: '普通用户', status: '禁用', registrationDate: '2023-04-10', lastLogin: '2023-09-01 11:20' },
    { id: 5, username: 'user4', email: 'user4@example.com', role: '普通用户', status: '活跃', registrationDate: '2023-05-05', lastLogin: '2023-09-27 10:05' }
  ];
  
  // 生成表格行
  let tableHtml = '';
  mockUsers.forEach(user => {
    const statusClass = user.status === '活跃' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const isAdmin = user.role === '管理员';
    
    tableHtml += `
      <tr class="hover:bg-gray-50 transition-colors duration-200" data-user-id="${user.id}">
        <td class="py-3 px-4 border-b">${user.id}</td>
        <td class="py-3 px-4 border-b">${user.username}${isAdmin ? ' <span class="text-xs bg-blue-100 text-blue-800 px-1 rounded">管理员</span>' : ''}</td>
        <td class="py-3 px-4 border-b">${user.email}</td>
        <td class="py-3 px-4 border-b">${user.role}</td>
        <td class="py-3 px-4 border-b">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
            ${user.status}
          </span>
        </td>
        <td class="py-3 px-4 border-b">${user.registrationDate}</td>
        <td class="py-3 px-4 border-b">${user.lastLogin}</td>
        <td class="py-3 px-4 border-b">
          <div class="flex space-x-2">
            ${isAdmin ? '' : `
              <button class="status-toggle p-1 text-gray-600 hover:text-blue-600" data-user-id="${user.id}" data-current-status="${user.status}">
                <i class="fas ${user.status === '活跃' ? 'fa-ban' : 'fa-check-circle'}"></i>
              </button>
              <button class="delete-user p-1 text-gray-600 hover:text-red-600" data-user-id="${user.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = tableHtml;
}

/**
 * 初始化用户搜索
 */
function initUserSearch() {
  const userSearchInput = document.getElementById('user-search');
  if (userSearchInput) {
    userSearchInput.addEventListener('input', debounce(handleUserSearch, 300));
  }
}

/**
 * 处理用户搜索
 */
function handleUserSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('#user-management-table tbody tr');
  
  rows.forEach(row => {
    const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
    const role = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
    
    if (username.includes(searchTerm) || email.includes(searchTerm) || role.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * 初始化用户状态切换
 */
function initUserStatusToggle() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.status-toggle')) {
      const toggleBtn = e.target.closest('.status-toggle');
      const userId = toggleBtn.dataset.userId;
      const currentStatus = toggleBtn.dataset.currentStatus;
      
      // 确认切换状态
      if (confirm(`确定要将用户状态从"${currentStatus}"切换为"${currentStatus === '活跃' ? '禁用' : '活跃'}"吗？`)) {
        // 模拟状态切换
        console.log(`切换用户 ${userId} 的状态`);
        
        // 更新UI
        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
        if (row) {
          const statusCell = row.querySelector('td:nth-child(5) span');
          const iconElement = toggleBtn.querySelector('i');
          
          if (statusCell && iconElement) {
            if (currentStatus === '活跃') {
              statusCell.textContent = '禁用';
              statusCell.classList.remove('bg-green-100', 'text-green-800');
              statusCell.classList.add('bg-red-100', 'text-red-800');
              iconElement.classList.remove('fa-ban');
              iconElement.classList.add('fa-check-circle');
              toggleBtn.dataset.currentStatus = '禁用';
            } else {
              statusCell.textContent = '活跃';
              statusCell.classList.remove('bg-red-100', 'text-red-800');
              statusCell.classList.add('bg-green-100', 'text-green-800');
              iconElement.classList.remove('fa-check-circle');
              iconElement.classList.add('fa-ban');
              toggleBtn.dataset.currentStatus = '活跃';
            }
          }
        }
      }
    }
  });
}

/**
 * 初始化用户删除功能
 */
function initUserDelete() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.delete-user')) {
      const deleteBtn = e.target.closest('.delete-user');
      const userId = deleteBtn.dataset.userId;
      
      // 确认删除
      if (confirm(`确定要删除用户 ${userId} 吗？此操作不可撤销。`)) {
        // 模拟删除操作
        console.log(`删除用户 ${userId}`);
        
        // 从表格中移除行
        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
        if (row) {
          row.style.opacity = '0';
          row.style.transition = 'opacity 0.3s ease';
          
          setTimeout(() => {
            row.remove();
          }, 300);
        }
      }
    }
  });
}

/**
 * 初始化系统日志功能
 */
function initSystemLogs() {
  const logsTable = document.getElementById('system-logs-table');
  if (logsTable) {
    const tableBody = logsTable.querySelector('tbody');
    if (tableBody) {
      // 模拟加载日志数据
      loadSystemLogs(tableBody);
      
      // 添加日志筛选功能
      initLogFilter();
    }
  }
}

/**
 * 加载系统日志
 */
function loadSystemLogs(tableBody) {
  // 模拟日志数据
  const mockLogs = [
    { id: 1, time: '2023-09-27 14:30:25', level: 'INFO', message: '系统启动成功', user: '系统' },
    { id: 2, time: '2023-09-27 14:25:18', level: 'WARNING', message: 'API调用频率过高', user: 'user1' },
    { id: 3, time: '2023-09-27 14:20:05', level: 'INFO', message: '管理员登录成功', user: 'admin' },
    { id: 4, time: '2023-09-27 14:15:32', level: 'ERROR', message: '数据库连接超时', user: '系统' },
    { id: 5, time: '2023-09-27 14:10:47', level: 'INFO', message: '用户登录成功', user: 'user4' },
    { id: 6, time: '2023-09-27 14:05:12', level: 'INFO', message: '量化策略运行完成', user: '系统' },
    { id: 7, time: '2023-09-27 14:00:00', level: 'INFO', message: '数据同步完成', user: '系统' }
  ];
  
  // 生成表格行
  let tableHtml = '';
  mockLogs.forEach(log => {
    let levelClass = '';
    switch(log.level) {
      case 'INFO':
        levelClass = 'bg-blue-100 text-blue-800';
        break;
      case 'WARNING':
        levelClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'ERROR':
        levelClass = 'bg-red-100 text-red-800';
        break;
      default:
        levelClass = 'bg-gray-100 text-gray-800';
    }
    
    tableHtml += `
      <tr class="hover:bg-gray-50 transition-colors duration-200">
        <td class="py-2 px-4 border-b">${log.id}</td>
        <td class="py-2 px-4 border-b">${log.time}</td>
        <td class="py-2 px-4 border-b">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelClass}">
            ${log.level}
          </span>
        </td>
        <td class="py-2 px-4 border-b">${log.message}</td>
        <td class="py-2 px-4 border-b">${log.user}</td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = tableHtml;
}

/**
 * 初始化日志筛选
 */
function initLogFilter() {
  const logLevelFilter = document.getElementById('log-level-filter');
  if (logLevelFilter) {
    logLevelFilter.addEventListener('change', () => {
      const selectedLevel = logLevelFilter.value;
      const logRows = document.querySelectorAll('#system-logs-table tbody tr');
      
      logRows.forEach(row => {
        const levelCell = row.querySelector('td:nth-child(3) span');
        if (levelCell) {
          const logLevel = levelCell.textContent;
          if (selectedLevel === 'all' || logLevel === selectedLevel) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        }
      });
    });
  }
}

/**
 * 初始化数据刷新功能
 */
function initDataRefresh() {
  const refreshBtn = document.getElementById('refresh-data-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // 显示加载状态
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>刷新中...';
      
      // 模拟数据刷新
      setTimeout(() => {
        console.log('数据刷新完成');
        
        // 恢复按钮状态
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>刷新数据';
        
        // 显示刷新成功提示
        const refreshMessage = document.getElementById('refresh-message');
        if (refreshMessage) {
          refreshMessage.classList.remove('hidden');
          refreshMessage.classList.add('opacity-100');
          
          setTimeout(() => {
            refreshMessage.classList.add('opacity-0');
            setTimeout(() => {
              refreshMessage.classList.add('hidden');
            }, 300);
          }, 2000);
        }
        
        // 重新加载数据
        const userTableBody = document.getElementById('user-management-table').querySelector('tbody');
        const logsTableBody = document.getElementById('system-logs-table').querySelector('tbody');
        
        if (userTableBody) loadUserManagementData(userTableBody);
        if (logsTableBody) loadSystemLogs(logsTableBody);
        
        // 重新初始化事件监听器
        initUserStatusToggle();
        initUserDelete();
      }, 2000);
    });
  }
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#admin-panel-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
  
  // 为管理面板添加安全提示动画
  const securityAlert = document.getElementById('admin-security-alert');
  if (securityAlert) {
    // 添加闪烁效果
    setInterval(() => {
      securityAlert.classList.toggle('opacity-100');
      securityAlert.classList.toggle('opacity-80');
    }, 3000);
  }
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 导航函数（用于内部导航）
 */
function navigateTo(pageId) {
  // 调用全局导航函数
  if (window.navigateTo) {
    window.navigateTo(pageId);
  } else {
    // 降级处理
    console.warn('全局导航函数未找到');
    window.location.href = `#${pageId}`;
  }
}