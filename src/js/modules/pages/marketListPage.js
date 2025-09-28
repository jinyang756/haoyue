/**
 * 行情列表页面模块 - 实现股票行情列表、筛选和排序功能
 */

/**
 * 初始化行情列表页面
 */
export function initMarketList() {
  console.log('行情列表模块已加载');
  
  // 初始化行情表格功能
  initMarketTable();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化筛选和排序功能
  initFilterAndSort();
}

/**
 * 初始化行情表格
 */
function initMarketTable() {
  // 模拟加载行情数据
  const marketTable = document.getElementById('market-table');
  if (marketTable) {
    // 显示加载状态
    const tableBody = marketTable.querySelector('tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8">加载行情数据中...</td></tr>';
      
      // 模拟数据加载延迟
      setTimeout(() => {
        loadMarketData(tableBody);
      }, 800);
    }
  }
}

/**
 * 加载行情数据
 */
function loadMarketData(tableBody) {
  // 模拟行情数据
  const mockMarketData = [
    { code: '600000', name: '浦发银行', price: '6.18', change: '+0.50%', volume: '2354万', marketCap: '3256亿' },
    { code: '600519', name: '贵州茅台', price: '1652.36', change: '+1.28%', volume: '896万', marketCap: '20736亿' },
    { code: '000858', name: '五粮液', price: '182.55', change: '+0.86%', volume: '2145万', marketCap: '6387亿' },
    { code: '000333', name: '美的集团', price: '52.43', change: '-0.34%', volume: '1876万', marketCap: '3896亿' },
    { code: '000001', name: '平安银行', price: '12.86', change: '+0.23%', volume: '3489万', marketCap: '4235亿' },
    { code: '601318', name: '中国平安', price: '48.65', change: '+0.41%', volume: '2756万', marketCap: '10245亿' },
    { code: '600900', name: '长江电力', price: '22.45', change: '-0.13%', volume: '1245万', marketCap: '4356亿' },
    { code: '601899', name: '紫金矿业', price: '9.24', change: '+2.32%', volume: '8765万', marketCap: '3256亿' },
    { code: '000725', name: '京东方A', price: '4.26', change: '-0.69%', volume: '7654万', marketCap: '2156亿' },
    { code: '600036', name: '招商银行', price: '32.45', change: '+0.78%', volume: '3456万', marketCap: '8976亿' }
  ];
  
  // 生成表格行
  let tableHtml = '';
  mockMarketData.forEach((stock, index) => {
    const isUp = stock.change.startsWith('+');
    const isDown = stock.change.startsWith('-');
    const changeClass = isUp ? 'text-red-500' : isDown ? 'text-green-500' : '';
    
    tableHtml += `
      <tr class="hover:bg-gray-50 transition-colors duration-200" data-stock-code="${stock.code}">
        <td class="py-3 px-4 border-b">${index + 1}</td>
        <td class="py-3 px-4 border-b">
          <div class="font-medium">${stock.name}</div>
          <div class="text-sm text-gray-500">${stock.code}</div>
        </td>
        <td class="py-3 px-4 border-b font-medium">${stock.price}</td>
        <td class="py-3 px-4 border-b font-medium ${changeClass}">${stock.change}</td>
        <td class="py-3 px-4 border-b">${stock.volume}</td>
        <td class="py-3 px-4 border-b">${stock.marketCap}</td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = tableHtml;
  
  // 添加股票行点击事件
  addStockRowClickEvents();
}

/**
 * 添加股票行点击事件
 */
function addStockRowClickEvents() {
  const stockRows = document.querySelectorAll('#market-table tbody tr');
  stockRows.forEach(row => {
    row.addEventListener('click', () => {
      const stockCode = row.dataset.stockCode;
      const stockName = row.querySelector('td:nth-child(2) .font-medium').textContent;
      
      // 显示股票详情（这里只是模拟，实际应该跳转到详情页或显示详情弹窗）
      console.log(`查看股票详情: ${stockName}(${stockCode})`);
      
      // 添加点击效果
      row.classList.add('bg-blue-50');
      setTimeout(() => {
        row.classList.remove('bg-blue-50');
      }, 200);
    });
  });
}

/**
 * 初始化筛选和排序功能
 */
function initFilterAndSort() {
  const sortButtons = document.querySelectorAll('#market-table thead th[data-sort]');
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sortField = button.dataset.sort;
      const isAscending = button.classList.toggle('sort-asc');
      
      // 重置其他排序按钮
      sortButtons.forEach(btn => {
        if (btn !== button) {
          btn.classList.remove('sort-asc', 'sort-desc');
        }
      });
      
      // 添加排序图标
      button.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
      
      // 执行排序操作
      sortMarketData(sortField, isAscending);
    });
  });
  
  // 初始化搜索功能
  const searchInput = document.getElementById('stock-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleStockSearch, 300));
  }
}

/**
 * 排序行情数据
 */
function sortMarketData(field, isAscending) {
  const tableBody = document.getElementById('market-table').querySelector('tbody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));
  
  rows.sort((a, b) => {
    let aValue, bValue;
    
    switch(field) {
      case 'code':
        aValue = a.querySelector('td:nth-child(2) .text-sm').textContent;
        bValue = b.querySelector('td:nth-child(2) .text-sm').textContent;
        break;
      case 'name':
        aValue = a.querySelector('td:nth-child(2) .font-medium').textContent;
        bValue = b.querySelector('td:nth-child(2) .font-medium').textContent;
        break;
      case 'price':
        aValue = parseFloat(a.querySelector('td:nth-child(3)').textContent);
        bValue = parseFloat(b.querySelector('td:nth-child(3)').textContent);
        break;
      case 'change':
        aValue = parseFloat(a.querySelector('td:nth-child(4)').textContent);
        bValue = parseFloat(b.querySelector('td:nth-child(4)').textContent);
        break;
      default:
        return 0;
    }
    
    if (isAscending) {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // 重新插入排序后的行
  rows.forEach(row => tableBody.appendChild(row));
}

/**
 * 处理股票搜索
 */
function handleStockSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('#market-table tbody tr');
  
  rows.forEach(row => {
    const stockName = row.querySelector('td:nth-child(2) .font-medium').textContent.toLowerCase();
    const stockCode = row.querySelector('td:nth-child(2) .text-sm').textContent.toLowerCase();
    
    if (stockName.includes(searchTerm) || stockCode.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#market-list-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
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