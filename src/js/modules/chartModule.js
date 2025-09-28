// 图表模块 - 处理市场指数图表和回测结果可视化

/**
 * 初始化市场指数图表
 * 创建上证指数、深证成指和创业板指的迷你图表
 */
export function initMarketIndexCharts() {
  // 上证指数图表
  initIndexChart('sse-chart', getRandomStockData(20), '#e53e3e', '000001');
  
  // 深证成指图表
  initIndexChart('szse-chart', getRandomStockData(20), '#dd6b20', '399001');
  
  // 创业板指图表
  initIndexChart('gem-chart', getRandomStockData(20), '#38a169', '399006');
}

/**
 * 初始化单个指数图表
 * @param {string} canvasId - Canvas元素ID
 * @param {Array} data - 图表数据
 * @param {string} color - 图表颜色
 * @param {string} code - 指数代码
 */
function initIndexChart(canvasId, data, color, code) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  try {
    // 销毁可能存在的旧图表
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // 创建新图表
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: Array(data.length).fill(''),
        datasets: [{
          label: code,
          data: data,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  } catch (error) {
    console.error(`初始化图表${canvasId}失败:`, error);
  }
}

/**
 * 初始化回测结果图表
 */
export function initBacktestChart() {
  const canvas = document.getElementById('backtest-chart');
  if (!canvas) return;
  
  try {
    // 销毁可能存在的旧图表
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // 生成模拟回测数据
    const dates = generateDates(12); // 生成12个月的数据
    const strategyReturns = generateBacktestData(dates.length);
    const benchmarkReturns = generateBenchmarkData(strategyReturns);
    
    // 创建回测图表
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: '策略收益率',
            data: strategyReturns,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
          },
          {
            label: '基准收益率',
            data: benchmarkReturns,
            borderColor: '#94a3b8',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('zh-CN', {
                    style: 'percent',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(context.parsed.y / 100);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  } catch (error) {
    console.error('初始化回测图表失败:', error);
  }
}

/**
 * 创建粒子效果
 * @param {HTMLCanvasElement} canvas - Canvas元素
 */
export function createParticleEffect(canvas) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  
  // 设置Canvas尺寸
  function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    initParticles();
  }
  
  // 初始化粒子
  function initParticles() {
    particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.5 + 0.2})`
      });
    }
  }
  
  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制黑洞中心
    drawBlackHole();
    
    // 更新和绘制粒子
    for (let i = 0; i < particles.length; i++) {
      updateParticle(particles[i]);
      drawParticle(particles[i]);
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // 绘制黑洞中心
  function drawBlackHole() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 40;
    
    // 绘制黑洞渐变
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(0.5, 'rgba(26, 32, 44, 0.5)');
    gradient.addColorStop(1, 'rgba(26, 32, 44, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制黑洞核心
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();
    
    // 绘制黑洞边缘光效
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // 更新粒子位置
  function updateParticle(particle) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 计算粒子到中心的距离
    const dx = centerX - particle.x;
    const dy = centerY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果粒子离中心足够近，给它一个向中心的加速度
    if (distance < 150) {
      const force = (150 - distance) / 1500; // 随距离减小而增大的力
      particle.speedX += (dx / distance) * force;
      particle.speedY += (dy / distance) * force;
    }
    
    // 更新粒子位置
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    // 边界检查 - 粒子出边界后重新从另一边进入
    if (particle.x < 0) particle.x = canvas.width;
    else if (particle.x > canvas.width) particle.x = 0;
    
    if (particle.y < 0) particle.y = canvas.height;
    else if (particle.y > canvas.height) particle.y = 0;
  }
  
  // 绘制粒子
  function drawParticle(particle) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  }
  
  // 初始化
  resizeCanvas();
  animate();
  
  // 窗口大小改变时重新调整Canvas
  window.addEventListener('resize', resizeCanvas);
  
  // 提供停止动画的方法
  return {
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      window.removeEventListener('resize', resizeCanvas);
    }
  };
}

// 工具函数：生成随机股票数据
function getRandomStockData(length) {
  const data = [];
  let value = 100 + Math.random() * 20;
  
  for (let i = 0; i < length; i++) {
    // 随机波动
    const change = (Math.random() - 0.48) * 2; // 轻微上涨趋势
    value += change;
    data.push(value);
  }
  
  return data;
}

// 工具函数：生成日期标签
function generateDates(count) {
  const dates = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  
  return dates;
}

// 工具函数：生成回测数据
function generateBacktestData(length) {
  const data = [];
  let value = 0;
  
  for (let i = 0; i < length; i++) {
    // 模拟策略收益，带一定的趋势性
    const trend = i * 0.5; // 轻微的上升趋势
    const noise = (Math.random() - 0.5) * 5;
    value = trend + noise;
    data.push(value);
  }
  
  return data;
}

// 工具函数：生成基准数据
function generateBenchmarkData(strategyData) {
  return strategyData.map(value => {
    // 基准收益略低于策略收益
    return value * 0.8 + (Math.random() - 0.5) * 2;
  });
}

/**
 * 初始化量化策略图表
 * 用于量化选股页面的策略表现展示
 */
export function initQuantStrategyChart() {
  // 获取图表容器
  const quantChartCanvas = document.getElementById('quant-strategy-chart');
  
  // 检查图表容器和Chart库是否存在
  if (!quantChartCanvas || typeof Chart === 'undefined') {
    console.log('量化策略图表容器不存在或Chart库未加载');
    return;
  }
  
  try {
    // 销毁可能存在的旧图表
    const existingChart = Chart.getChart(quantChartCanvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // 生成模拟数据
    const dataLength = 30;
    const strategyData = generateBacktestData(dataLength);
    const benchmarkData = generateBenchmarkData(strategyData);
    const dates = generateDates(dataLength);
    
    // 创建新图表
    new Chart(quantChartCanvas, {
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
            label: '沪深300基准',
            data: benchmarkData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
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
            labels: {
              color: '#E5E7EB'
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(107, 114, 128, 0.2)'
            },
            ticks: {
              color: '#9CA3AF'
            }
          },
          y: {
            grid: {
              color: 'rgba(107, 114, 128, 0.2)'
            },
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return value.toFixed(2) + '%';
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('初始化量化策略图表失败:', error);
  }
}