/**
 * 慈善页面模块 - 实现公益捐赠和慈善活动功能
 */

/**
 * 初始化慈善页面
 */
export function initCharityPage() {
  console.log('慈善页面模块已加载');
  
  // 初始化捐赠功能
  initDonationFunctionality();
  
  // 初始化慈善项目列表
  initCharityProjects();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化捐赠成功提示弹窗
  initDonationSuccessModal();
}

/**
 * 初始化捐赠功能
 */
function initDonationFunctionality() {
  // 获取捐赠按钮
  const donateButtons = document.querySelectorAll('.donate-btn');
  const customAmountBtn = document.getElementById('custom-amount-btn');
  const customAmountInput = document.getElementById('custom-amount');
  const donateConfirmBtn = document.getElementById('donate-confirm-btn');
  
  // 捐赠金额选择按钮事件
  donateButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 移除其他按钮的选中状态
      donateButtons.forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
      donateButtons.forEach(btn => btn.classList.add('bg-gray-100', 'text-gray-800'));
      
      // 添加当前按钮的选中状态
      button.classList.remove('bg-gray-100', 'text-gray-800');
      button.classList.add('bg-blue-600', 'text-white');
      
      // 清空自定义金额输入
      if (customAmountInput) {
        customAmountInput.value = '';
      }
    });
  });
  
  // 自定义金额按钮事件
  if (customAmountBtn && customAmountInput) {
    customAmountBtn.addEventListener('click', () => {
      // 移除预定义金额按钮的选中状态
      donateButtons.forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
      donateButtons.forEach(btn => btn.classList.add('bg-gray-100', 'text-gray-800'));
      
      // 聚焦到自定义金额输入框
      customAmountInput.focus();
    });
  }
  
  // 确认捐赠按钮事件
  if (donateConfirmBtn) {
    donateConfirmBtn.addEventListener('click', handleDonationConfirm);
  }
}

/**
 * 处理捐赠确认
 */
function handleDonationConfirm() {
  // 获取选中的捐赠金额
  let amount = 0;
  
  // 检查是否有选中的预定义金额
  const selectedAmountBtn = document.querySelector('.donate-btn.bg-blue-600');
  if (selectedAmountBtn) {
    amount = parseInt(selectedAmountBtn.dataset.amount);
  } else {
    // 检查自定义金额
    const customAmountInput = document.getElementById('custom-amount');
    if (customAmountInput && customAmountInput.value) {
      amount = parseInt(customAmountInput.value);
    }
  }
  
  // 验证金额
  if (amount <= 0) {
    alert('请选择或输入有效的捐赠金额');
    return;
  }
  
  // 验证捐赠人信息
  const nameInput = document.getElementById('donor-name');
  const phoneInput = document.getElementById('donor-phone');
  const emailInput = document.getElementById('donor-email');
  
  if (!nameInput.value.trim()) {
    alert('请输入您的姓名');
    nameInput.focus();
    return;
  }
  
  // 模拟捐赠处理过程
  console.log(`捐赠信息: 金额=${amount}元, 姓名=${nameInput.value}, 电话=${phoneInput.value || '未提供'}, 邮箱=${emailInput.value || '未提供'}`);
  
  // 显示捐赠成功弹窗
  showDonationSuccessModal(amount);
}

/**
 * 初始化慈善项目列表
 */
function initCharityProjects() {
  // 模拟加载慈善项目数据
  const projectsContainer = document.getElementById('charity-projects');
  if (projectsContainer) {
    // 显示加载状态
    projectsContainer.innerHTML = '<div class="text-center py-8">加载慈善项目中...</div>';
    
    // 模拟数据加载延迟
    setTimeout(() => {
      loadCharityProjects(projectsContainer);
    }, 1200);
  }
}

/**
 * 加载慈善项目数据
 */
function loadCharityProjects(container) {
  // 模拟慈善项目数据
  const mockProjects = [
    {
      id: 1,
      title: '乡村教育支持计划',
      description: '为偏远地区学校提供教学设备和师资培训，帮助乡村儿童获得更好的教育资源。',
      raised: 125800,
      goal: 200000,
      image: '/images/charity/education.jpg',
      progress: 62.9
    },
    {
      id: 2,
      title: '贫困地区医疗救助',
      description: '为贫困家庭提供医疗援助，帮助他们获得必要的医疗服务和药物。',
      raised: 89600,
      goal: 150000,
      image: '/images/charity/medical.jpg',
      progress: 59.7
    },
    {
      id: 3,
      title: '环境保护植树计划',
      description: '在荒漠化地区种植树木，改善生态环境，减少水土流失。',
      raised: 168500,
      goal: 300000,
      image: '/images/charity/environment.jpg',
      progress: 56.2
    }
  ];
  
  // 生成项目卡片
  let projectsHtml = '';
  mockProjects.forEach((project, index) => {
    projectsHtml += `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl opacity-0 translate-y-4" style="transition-delay: ${index * 200}ms">
        <div class="h-48 bg-gray-200 relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <h3 class="text-white text-xl font-bold px-4 text-center">${project.title}</h3>
          </div>
        </div>
        <div class="p-5">
          <p class="text-gray-600 mb-4">${project.description}</p>
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium">已筹: ¥${project.raised.toLocaleString()}</span>
              <span class="text-gray-500">目标: ¥${project.goal.toLocaleString()}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.progress}%"></div>
            </div>
          </div>
          <button class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200" data-project-id="${project.id}">
            立即捐赠
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${projectsHtml}</div>`;
  
  // 触发动画
  setTimeout(() => {
    const projectCards = container.querySelectorAll('.opacity-0');
    projectCards.forEach(card => {
      card.classList.remove('opacity-0', 'translate-y-4');
    });
  }, 100);
  
  // 添加项目卡片捐赠按钮事件
  const projectDonateBtns = container.querySelectorAll('button[data-project-id]');
  projectDonateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.projectId;
      // 滚动到捐赠表单区域
      document.getElementById('donation-form-section').scrollIntoView({ behavior: 'smooth' });
      // 可以根据项目ID设置默认捐赠金额等
      console.log(`选择捐赠项目 ${projectId}`);
    });
  });
}

/**
 * 初始化捐赠成功提示弹窗
 */
function initDonationSuccessModal() {
  const closeModalBtn = document.getElementById('close-success-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('donation-success-modal').classList.add('hidden');
    });
  }
}

/**
 * 显示捐赠成功弹窗
 */
function showDonationSuccessModal(amount) {
  const modal = document.getElementById('donation-success-modal');
  const amountDisplay = document.getElementById('donation-amount-display');
  
  if (modal && amountDisplay) {
    amountDisplay.textContent = amount;
    modal.classList.remove('hidden');
    
    // 清空捐赠表单
    document.getElementById('donor-name').value = '';
    document.getElementById('donor-phone').value = '';
    document.getElementById('donor-email').value = '';
    document.getElementById('custom-amount').value = '';
    
    // 重置捐赠金额选择
    const donateButtons = document.querySelectorAll('.donate-btn');
    donateButtons.forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-100', 'text-gray-800');
    });
  }
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#charity-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
}