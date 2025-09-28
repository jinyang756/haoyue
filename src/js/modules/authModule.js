// 认证模块
import { LoginSecurity } from '../utils/security.js';
import { FormValidator, ValidationRules, initFormValidations } from '../utils/formValidator.js';

// 当前用户状态
let currentUser = null;
let isAdmin = false;

// 当前日期和时间
function updateDateTime() {
  const now = new Date();
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');
  
  if (dateElement && timeElement) {
    dateElement.textContent = now.toLocaleDateString('zh-CN', dateOptions);
    timeElement.textContent = now.toLocaleTimeString('zh-CN', timeOptions);
  }
}

// 检查管理员是否已登录
function isAdminLoggedIn() {
  // 这里可以根据实际情况实现登录状态检查
  // 目前简单模拟，假设管理员页面显示即为已登录
  const adminPanelPage = document.getElementById('admin-panel-page');
  return adminPanelPage && !adminPanelPage.classList.contains('hidden');
}

// 初始化登录模态框
function initLoginModal() {
  // 登录按钮事件
  const loginBtn = document.getElementById('login-btn');
  const loginModalBtn = document.getElementById('login-modal-btn');
  const closeLoginModalBtn = document.getElementById('close-login-modal');
  const loginModal = document.getElementById('login-modal');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
    });
  }
  
  if (loginModalBtn) {
    loginModalBtn.addEventListener('click', () => {
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
    });
  }
  
  if (closeLoginModalBtn && loginModal) {
    closeLoginModalBtn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });
  }
  
  // 点击模态框外部关闭
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.add('hidden');
      }
    });
  }
}

// 初始化捐赠功能
function initDonation() {
  const donateBtn = document.getElementById('donate-btn');
  const donateModal = document.getElementById('donate-modal');
  const closeDonateModalBtn = document.getElementById('close-donate-modal');
  
  if (donateBtn && donateModal) {
    donateBtn.addEventListener('click', () => {
      donateModal.classList.remove('hidden');
    });
  }
  
  if (closeDonateModalBtn && donateModal) {
    closeDonateModalBtn.addEventListener('click', () => {
      donateModal.classList.add('hidden');
    });
  }
}

// 初始化文案生成功能
function initContentGeneration() {
  const contentGenBtn = document.getElementById('content-gen-btn');
  const contentGenModal = document.getElementById('content-gen-modal');
  const closeContentGenModalBtn = document.getElementById('close-content-gen-modal');
  
  if (contentGenBtn && contentGenModal) {
    contentGenBtn.addEventListener('click', () => {
      contentGenModal.classList.remove('hidden');
    });
  }
  
  if (closeContentGenModalBtn && contentGenModal) {
    closeContentGenModalBtn.addEventListener('click', () => {
      contentGenModal.classList.add('hidden');
    });
  }
}

// 初始化功能回测
function initBacktest() {
  const backtestBtn = document.getElementById('backtest-btn');
  const backtestModal = document.getElementById('backtest-modal');
  const closeBacktestModalBtn = document.getElementById('close-backtest-modal');
  
  if (backtestBtn && backtestModal) {
    backtestBtn.addEventListener('click', () => {
      backtestModal.classList.remove('hidden');
    });
  }
  
  if (closeBacktestModalBtn && backtestModal) {
    closeBacktestModalBtn.addEventListener('click', () => {
      backtestModal.classList.add('hidden');
    });
  }
}

// 处理用户登录
async function handleLogin(username, password) {
  try {
    // 检查账户是否被锁定
    const isLocked = await LoginSecurity.isAccountLocked(username);
    if (isLocked) {
      const remainingTime = await LoginSecurity.getLockRemainingTime(username);
      alert(`账户已被锁定，请在${remainingTime}分钟后重试`);
      return false;
    }
    
    // 简单模拟登录验证
    if (username === 'admin' && password === 'admin123') {
      currentUser = username;
      isAdmin = true;
      
      // 登录成功，重置失败次数
      await LoginSecurity.resetFailedAttempts(username);
      
      // 更新UI
      const loginBtn = document.getElementById('login-btn');
      const logoutBtn = document.getElementById('logout-btn');
      if (loginBtn && logoutBtn) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
      }
      
      // 显示管理员功能
      showAdminFeatures();
      
      // 关闭登录模态框
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.classList.add('hidden');
      }
      
      return true;
    }
    
    // 登录失败，记录失败次数
    const failedAttempts = await LoginSecurity.recordFailedAttempt(username);
    const maxAttempts = LoginSecurity.MAX_FAILED_ATTEMPTS;
    
    // 提示用户剩余尝试次数
    if (failedAttempts < maxAttempts) {
      alert(`用户名或密码错误，您还有${maxAttempts - failedAttempts}次尝试机会`);
    } else {
      alert(`连续${maxAttempts}次登录失败，账户已被锁定${LoginSecurity.LOCK_DURATION}分钟`);
    }
  } catch (error) {
    console.error('登录过程出错:', error);
    alert('登录过程中发生错误，请稍后重试');
  }
  
  return false;
}

// 处理用户登出
function handleLogout() {
  currentUser = null;
  isAdmin = false;
  
  // 更新UI
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if (loginBtn && logoutBtn) {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
  
  // 隐藏管理员功能
  hideAdminFeatures();
  
  alert('已成功退出登录');
}

// 显示管理员功能
function showAdminFeatures() {
  const adminFeatures = document.querySelectorAll('.admin-only');
  adminFeatures.forEach(feature => {
    feature.classList.remove('hidden');
  });
}

// 隐藏管理员功能
function hideAdminFeatures() {
  const adminFeatures = document.querySelectorAll('.admin-only');
  adminFeatures.forEach(feature => {
    feature.classList.add('hidden');
  });
}

// 初始化认证UI
function initAuthUI() {
  // 初始化日期时间更新
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // 初始化登录模态框
  initLoginModal();
  
  // 初始化捐赠功能
  initDonation();
  
  // 初始化文案生成功能
  initContentGeneration();
  
  // 初始化功能回测
  initBacktest();
  
  // 绑定登出按钮事件
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 初始化表单验证功能
  initFormValidations();
  
  // 初始化用户登录表单验证
  const userLoginForm = document.getElementById('user-login-form');
  if (userLoginForm) {
    // 创建表单验证器实例
    const userValidator = new FormValidator('user-login-form');
    
    // 添加验证规则
    userValidator.addValidation('login-username', {
      required: true,
      requiredMessage: '请输入用户名',
      minLength: 3,
      minLengthMessage: '用户名长度不能少于3个字符',
      maxLength: 20,
      maxLengthMessage: '用户名长度不能超过20个字符'
    });
    
    userValidator.addValidation('login-password', {
      required: true,
      requiredMessage: '请输入密码',
      minLength: 6,
      minLengthMessage: '密码长度不能少于6个字符'
    });
    
    // 初始化验证器
    userValidator.init();
    
    // 监听表单验证通过事件
    userLoginForm.addEventListener('formValidated', async (e) => {
      const { loginUsername, loginPassword } = e.detail.formData;
      await handleLogin(loginUsername, loginPassword);
    });
    
    // 添加提交按钮点击事件
    const userLoginBtn = document.getElementById('user-login-btn');
    if (userLoginBtn) {
      userLoginBtn.addEventListener('click', () => {
        userValidator.validateAll();
      });
    }
  }
  
  // 初始化管理员登录表单验证
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    // 创建表单验证器实例
    const adminValidator = new FormValidator('admin-login-form');
    
    // 添加验证规则
    adminValidator.addValidation('admin-username', {
      required: true,
      requiredMessage: '请输入管理员用户名',
      minLength: 3,
      minLengthMessage: '用户名长度不能少于3个字符'
    });
    
    adminValidator.addValidation('admin-password', {
      required: true,
      requiredMessage: '请输入管理员密码',
      minLength: 6,
      minLengthMessage: '密码长度不能少于6个字符'
    });
    
    // 初始化验证器
    adminValidator.init();
    
    // 监听表单验证通过事件
    adminLoginForm.addEventListener('formValidated', async (e) => {
      const { adminUsername, adminPassword } = e.detail.formData;
      await handleLogin(adminUsername, adminPassword);
    });
    
    // 添加提交按钮点击事件
    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
      adminLoginBtn.addEventListener('click', () => {
        adminValidator.validateAll();
      });
    }
  }
}

// 导出函数
// 检查登录状态
export function checkLoginStatus() {
  return currentUser !== null;
}

// 检查管理员状态
export function checkAdminStatus() {
  return isAdmin;
}

// 获取当前用户
export function getCurrentUser() {
  return currentUser;
}

export { initAuthUI, handleLogin, handleLogout };