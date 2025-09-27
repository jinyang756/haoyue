// 内容生成和回测功能模块

/**
 * 初始化文案生成功能
 */
export function initContentGeneration() {
  const generateContentBtn = document.getElementById('generate-content-btn');
  if (generateContentBtn) {
    generateContentBtn.addEventListener('click', () => {
      const contentLoading = document.getElementById('content-loading');
      const contentResult = document.getElementById('content-result');
      
      // 显示加载状态
      if (contentLoading && contentResult) {
        contentLoading.classList.remove('hidden');
        contentResult.classList.add('hidden');
        
        // 模拟API请求延迟
        setTimeout(() => {
          // 隐藏加载状态，显示结果
          contentLoading.classList.add('hidden');
          contentResult.classList.remove('hidden');
        }, 1500);
      }
    });
  }
}

/**
 * 初始化功能回测
 */
export function initBacktest() {
  const runBacktestBtn = document.getElementById('run-backtest-btn');
  if (runBacktestBtn) {
    runBacktestBtn.addEventListener('click', () => {
      const backtestLoading = document.getElementById('backtest-loading');
      const backtestResult = document.getElementById('backtest-result');
      
      // 显示加载状态
      if (backtestLoading && backtestResult) {
        backtestLoading.classList.remove('hidden');
        backtestResult.classList.add('hidden');
        
        // 模拟回测延迟
        setTimeout(() => {
          // 隐藏加载状态，显示结果
          backtestLoading.classList.add('hidden');
          backtestResult.classList.remove('hidden');
          
          // 初始化回测图表
          initBacktestChart();
        }, 2000);
      }
    });
  }
}

/**
 * 初始化回测图表
 */
export function initBacktestChart() {
  const ctx = document.getElementById('backtest-chart');
  if (ctx && typeof Chart !== 'undefined') {
    const chartContext = ctx.getContext('2d');
    
    // 生成模拟数据
    const dates = [];
    const strategyData = [];
    const benchmarkData = [];
    
    let strategyValue = 100000;
    let benchmarkValue = 100000;
    
    // 生成过去5年的数据，每月一个点
    const today = new Date();
    for (let i = 60; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      dates.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }));
      
      // 模拟策略收益
      const strategyReturn = (Math.random() * 4 - 1.5) / 100; // -1.5% 到 2.5%
      strategyValue *= (1 + strategyReturn);
      strategyData.push(strategyValue);
      
      // 模拟基准收益
      const benchmarkReturn = (Math.random() * 3 - 1.5) / 100; // -1.5% 到 1.5%
      benchmarkValue *= (1 + benchmarkReturn);
      benchmarkData.push(benchmarkValue);
    }
    
    // 创建图表
    new Chart(chartContext, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: '皓月量化策略',
            data: strategyData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true
          },
          {
            label: '沪深300指数',
            data: benchmarkData,
            borderColor: '#9CA3AF',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#D1D5DB'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#9CA3AF',
              maxTicksLimit: 12
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', notation: 'compact', compactDisplay: 'short' }).format(value);
              }
            }
          }
        }
      }
    });
  }
}

/**
 * 初始化捐赠功能
 */
export function initDonation() {
  const donationBtn = document.getElementById('donation-btn');
  if (donationBtn) {
    donationBtn.addEventListener('click', () => {
      const donationAmount = document.getElementById('donation-amount').value;
      if (!donationAmount || donationAmount <= 0) {
        alert('请输入有效的捐赠金额');
        return;
      }
      
      // 显示捐赠成功提示
      const donationSuccess = document.getElementById('donation-success');
      if (donationSuccess) {
        donationSuccess.classList.remove('hidden');
      }
    });
  }
  
  // 关闭捐赠成功提示
  const closeDonationSuccess = document.getElementById('close-donation-success');
  if (closeDonationSuccess) {
    closeDonationSuccess.addEventListener('click', () => {
      const donationSuccess = document.getElementById('donation-success');
      if (donationSuccess) {
        donationSuccess.classList.add('hidden');
      }
    });
  }
}