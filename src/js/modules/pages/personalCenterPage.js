/**
 * 个人中心页面模块 - 实现用户个人信息管理和偏好设置
 */

/**
 * 初始化个人中心页面
 */
export function initPersonalCenter() {
  console.log('个人中心模块已加载');
  
  // 初始化用户信息展示
  initUserInfo();
  
  // 初始化标签导航
  initSettingsTabs();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化个人设置表单
  initUserSettingsForm();
  
  // 初始化密码修改功能
  initPasswordChange();
}

/**
 * 初始化用户信息展示
 */
function initUserInfo() {
  // 从localStorage获取用户信息
  const userInfo = localStorage.getItem('userInfo');
  let userData = null;
  
  if (userInfo) {
    try {
      userData = JSON.parse(userInfo);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  // 如果没有用户信息，使用默认值
  if (!userData) {
    userData = {
      username: '用户123456',
      email: 'user@example.com',
      registrationDate: '2023-01-15',
      lastLogin: new Date().toLocaleString('zh-CN'),
      avatar: '/images/avatar/default-avatar.png'
    };
  }
  
  // 更新页面上的用户信息
  const usernameElement = document.getElementById('user-name');
  const emailElement = document.getElementById('user-email');
  const regDateElement = document.getElementById('registration-date');
  const lastLoginElement = document.getElementById('last-login');
  const avatarElement = document.getElementById('user-avatar');
  
  if (usernameElement) usernameElement.textContent = userData.username;
  if (emailElement) emailElement.textContent = userData.email;
  if (regDateElement) regDateElement.textContent = userData.registrationDate;
  if (lastLoginElement) lastLoginElement.textContent = userData.lastLogin;
  if (avatarElement) {
    avatarElement.src = userData.avatar;
    avatarElement.alt = userData.username;
  }
}

/**
 * 初始化设置标签导航
 */
function initSettingsTabs() {
  const tabButtons = document.querySelectorAll('.settings-tab-button');
  const tabContents = document.querySelectorAll('.settings-tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // 更新按钮状态
      tabButtons.forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-800');
      });
      button.classList.remove('bg-gray-100', 'text-gray-800');
      button.classList.add('bg-blue-600', 'text-white');
      
      // 更新内容显示
      tabContents.forEach(content => {
        content.classList.add('hidden');
        if (content.id === `${tabId}-content`) {
          content.classList.remove('hidden');
          // 添加内容动画
          animateTabContent(content);
        }
      });
    });
  });
}

/**
 * 标签内容动画
 */
function animateTabContent(content) {
  const elements = content.querySelectorAll('.animate-on-tab');
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
 * 初始化用户设置表单
 */
function initUserSettingsForm() {
  const settingsForm = document.getElementById('user-settings-form');
  if (settingsForm) {
    // 加载用户设置（模拟数据）
    loadUserSettings();
    
    // 添加表单提交事件
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUserSettings();
    });
  }
}

/**
 * 加载用户设置
 */
function loadUserSettings() {
  // 从localStorage获取用户设置
  const userSettings = localStorage.getItem('userSettings');
  let settings = null;
  
  if (userSettings) {
    try {
      settings = JSON.parse(userSettings);
    } catch (error) {
      console.error('解析用户设置失败:', error);
    }
  }
  
  // 使用默认设置或已保存的设置
  if (!settings) {
    settings = {
      receiveNotifications: true,
      theme: 'light',
      language: 'zh-CN',
      marketReminder: false,
      strategyReminder: true
    };
  }
  
  // 设置表单值
  document.getElementById('notifications-toggle').checked = settings.receiveNotifications;
  document.getElementById('market-reminder-toggle').checked = settings.marketReminder;
  document.getElementById('strategy-reminder-toggle').checked = settings.strategyReminder;
  
  // 设置主题选择
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = settings.theme;
    themeSelect.addEventListener('change', applyTheme);
  }
  
  // 设置语言选择
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.value = settings.language;
  }
}

/**
 * 保存用户设置
 */
function saveUserSettings() {
  const settings = {
    receiveNotifications: document.getElementById('notifications-toggle').checked,
    theme: document.getElementById('theme-select').value,
    language: document.getElementById('language-select').value,
    marketReminder: document.getElementById('market-reminder-toggle').checked,
    strategyReminder: document.getElementById('strategy-reminder-toggle').checked
  };
  
  // 保存到localStorage
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  // 应用主题
  applyTheme();
  
  // 显示保存成功提示
  showSaveSuccessMessage();
  
  console.log('用户设置已保存:', settings);
}

/**
 * 应用主题
 */
function applyTheme() {
  const theme = document.getElementById('theme-select').value;
  const htmlElement = document.documentElement;
  
  // 移除所有主题类
  htmlElement.classList.remove('dark', 'light');
  
  // 添加选中的主题类
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.add('light');
  }
}

/**
 * 显示保存成功消息
 */
function showSaveSuccessMessage() {
  const message = document.getElementById('save-success-message');
  if (message) {
    message.classList.remove('hidden');
    message.classList.add('opacity-100');
    
    setTimeout(() => {
      message.classList.add('opacity-0');
      setTimeout(() => {
        message.classList.add('hidden');
      }, 300);
    }, 2000);
  }
}

/**
 * 初始化密码修改功能
 */
function initPasswordChange() {
  const passwordForm = document.getElementById('password-change-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePasswordChange();
    });
  }
}

/**
 * 处理密码修改
 */
function handlePasswordChange() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // 简单验证
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('请填写所有密码字段');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('新密码和确认密码不一致');
    return;
  }
  
  if (newPassword.length < 8) {
    alert('新密码长度至少为8位');
    return;
  }
  
  // 模拟密码修改
  console.log('密码修改请求已提交');
  
  // 显示修改成功提示
  const passwordSuccessMessage = document.getElementById('password-success-message');
  if (passwordSuccessMessage) {
    passwordSuccessMessage.classList.remove('hidden');
    passwordSuccessMessage.classList.add('opacity-100');
    
    // 清空表单
    document.getElementById('password-change-form').reset();
    
    setTimeout(() => {
      passwordSuccessMessage.classList.add('opacity-0');
      setTimeout(() => {
        passwordSuccessMessage.classList.add('hidden');
      }, 300);
    }, 3000);
  }
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#personal-center-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
  
  // 为用户头像添加脉动动画
  const userAvatar = document.getElementById('user-avatar');
  if (userAvatar) {
    userAvatar.classList.add('animate-pulse-slow');
  }
}