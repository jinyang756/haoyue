// 深证成指小图表模块
function initSZIndexChart() {
  const ctx = document.getElementById('sz-index-chart').getContext('2d');
  
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(30).fill(''),
      datasets: [{
        data: [12300, 12350, 12320, 12380, 12420, 12400, 12370, 12410, 12450, 12490, 12460, 12430, 12470, 12510, 12550, 12520, 12490, 12530, 12570, 12610, 12580, 12550, 12590, 12630, 12670, 12640, 12610, 12650, 12690, 12584],
        borderColor: '#EF4444',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false
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
      }
    }
  });
}

// 导出函数到window对象，供其他模块调用
window.initSZIndexChart = initSZIndexChart;