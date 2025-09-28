/**
 * API文档页面模块 - 实现皓月AI智能引擎API的详细文档和使用示例
 */

/**
 * 初始化API文档页面
 */
export function initApiDoc() {
  console.log('API文档模块已加载');
  
  // 初始化API分类导航
  initApiCategories();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化代码示例显示
  initCodeExamples();
  
  // 初始化API参数表格
  initApiParamsTables();
  
  // 初始化复制代码功能
  initCopyCodeFunctionality();
}

/**
 * 初始化API分类导航
 */
function initApiCategories() {
  const categoryLinks = document.querySelectorAll('.api-category-link');
  const apiSections = document.querySelectorAll('.api-section');
  
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = link.dataset.category;
      
      // 滚动到对应的API部分
      const targetSection = document.getElementById(categoryId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // 更新导航状态
      categoryLinks.forEach(navLink => {
        navLink.classList.remove('text-blue-600', 'font-medium');
        navLink.classList.add('text-gray-600');
      });
      link.classList.remove('text-gray-600');
      link.classList.add('text-blue-600', 'font-medium');
    });
  });
}

/**
 * 初始化代码示例显示
 */
function initCodeExamples() {
  const exampleToggles = document.querySelectorAll('.example-toggle');
  
  exampleToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const exampleId = toggle.dataset.example;
      const exampleContent = document.getElementById(`${exampleId}-content`);
      
      if (exampleContent) {
        const isHidden = exampleContent.classList.contains('hidden');
        
        if (isHidden) {
          exampleContent.classList.remove('hidden');
          toggle.textContent = '隐藏示例';
          toggle.classList.remove('bg-gray-100');
          toggle.classList.add('bg-blue-100');
        } else {
          exampleContent.classList.add('hidden');
          toggle.textContent = '查看示例';
          toggle.classList.remove('bg-blue-100');
          toggle.classList.add('bg-gray-100');
        }
      }
    });
  });
}

/**
 * 初始化API参数表格
 */
function initApiParamsTables() {
  const paramTables = document.querySelectorAll('.api-params-table');
  
  paramTables.forEach((table, index) => {
    // 添加延迟渐入动画
    table.style.opacity = '0';
    table.style.transform = 'translateY(10px)';
    table.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      table.style.opacity = '1';
      table.style.transform = 'translateY(0)';
    }, 200 + (index * 100));
  });
}

/**
 * 初始化复制代码功能
 */
function initCopyCodeFunctionality() {
  const copyButtons = document.querySelectorAll('.copy-code-btn');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const codeBlock = button.closest('.code-example').querySelector('code');
      
      if (codeBlock) {
        const codeText = codeBlock.textContent;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(codeText)
          .then(() => {
            // 显示复制成功提示
            const originalText = button.textContent;
            button.textContent = '已复制!';
            button.classList.add('bg-green-100', 'text-green-800');
            button.classList.remove('bg-gray-100', 'text-gray-700');
            
            setTimeout(() => {
              button.textContent = originalText;
              button.classList.remove('bg-green-100', 'text-green-800');
              button.classList.add('bg-gray-100', 'text-gray-700');
            }, 2000);
          })
          .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制代码');
          });
      }
    });
  });
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#api-doc-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
  
  // 为API分类导航添加悬停效果
  const categoryLinks = document.querySelectorAll('.api-category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateX(5px)';
      link.style.transition = 'transform 0.2s ease';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateX(0)';
    });
  });
  
  // 初始化代码高亮（模拟）
  highlightCodeExamples();
}

/**
 * 高亮代码示例
 */
function highlightCodeExamples() {
  const codeBlocks = document.querySelectorAll('.code-example code');
  
  codeBlocks.forEach(block => {
    // 这里可以添加真实的代码高亮实现
    // 为了演示，我们简单地添加一些样式类
    let highlightedCode = block.textContent;
    
    // 模拟JavaScript语法高亮
    if (block.classList.contains('language-javascript')) {
      // 关键字高亮
      const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'for', 'while', 'try', 'catch', 'finally', 'new', 'class', 'import', 'export'];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\b${keyword}\b`, 'g');
        highlightedCode = highlightedCode.replace(regex, `<span class="text-purple-600">${keyword}</span>`);
      });
      
      // 字符串高亮
      highlightedCode = highlightedCode.replace(/"([^"]*)"/g, '<span class="text-green-600">"$1"</span>');
      highlightedCode = highlightedCode.replace(/\'([^\']*)\'/g, '<span class="text-green-600">\'$1\'</span>');
      
      // 注释高亮
      highlightedCode = highlightedCode.replace(/\/\*([\s\S]*?)\*\//g, '<span class="text-gray-500">/*$1*/</span>');
      highlightedCode = highlightedCode.replace(/\/\/([^\n]*)/g, '<span class="text-gray-500">//$1</span>');
    }
    
    // 应用高亮后的代码
    block.innerHTML = highlightedCode;
  });
}

/**
 * 添加API测试功能（模拟）
 */
function initApiTesting() {
  const testButtons = document.querySelectorAll('.test-api-btn');
  
  testButtons.forEach(button => {
    button.addEventListener('click', () => {
      const apiEndpoint = button.dataset.endpoint;
      const testResult = document.getElementById(`test-result-${apiEndpoint}`);
      
      if (testResult) {
        // 显示加载状态
        testResult.innerHTML = '<div class="text-blue-500">测试中...</div>';
        
        // 模拟API请求延迟
        setTimeout(() => {
          // 生成模拟测试结果
          const mockResults = {
            'market/index': {
              status: 'success',
              data: {
                sh: 3726.18,
                sz: 12584.36,
                gem: 2543.76
              }
            },
            'stock/search': {
              status: 'success',
              data: {
                stocks: [
                  { code: '600519', name: '贵州茅台', price: 1652.36 },
                  { code: '000858', name: '五粮液', price: 182.55 }
                ]
              }
            },
            'strategy/quant': {
              status: 'success',
              data: {
                recommendedStocks: [
                  { code: '600519', name: '贵州茅台', score: 98 },
                  { code: '600276', name: '恒瑞医药', score: 92 }
                ]
              }
            }
          };
          
          const result = mockResults[apiEndpoint] || {
            status: 'error',
            message: '未找到该API的测试数据'
          };
          
          // 显示测试结果
          if (result.status === 'success') {
            testResult.innerHTML = `
              <div class="text-green-500 mb-2">测试成功!</div>
              <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">${JSON.stringify(result.data, null, 2)}</pre>
            `;
          } else {
            testResult.innerHTML = `<div class="text-red-500">测试失败: ${result.message}</div>`;
          }
        }, 1500);
      }
    });
  });
}