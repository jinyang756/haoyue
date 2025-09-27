// 认证模块 - 处理用户登录、注册和管理员验证

// 用户认证数据存储
let currentUser = null;
let isAdmin = false;

// 模拟用户数据库
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', isAdmin: true },
  { id: 2, username: 'user', password: 'user123', isAdmin: false }
];

// 初始化认证UI
export function initAuthUI() {
  // 登录模态框相关元素
  const loginModal = document.getElementById('login-modal');
  const openLoginBtn = document.getElementById('login-btn');
  const closeLoginBtn = document.getElementById('close-login-modal');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // 登录表单提交
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  
  // 注册表单提交
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
  }
  
  // 打开登录模态框
  if (openLoginBtn && loginModal) {
    openLoginBtn.addEventListener('click', () => {
      loginModal.classList.remove('hidden');
      // 重置表单
      if (loginForm) {
        loginForm.reset();
      }
      if (registerForm) {
        registerForm.reset();
      }
      // 确保显示登录表单
      if (loginForm && registerForm) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      }
    });
  }
  
  // 关闭登录模态框
  if (closeLoginBtn && loginModal) {
    closeLoginBtn.addEventListener('click', () => {
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
  
  // 切换到注册表单
  if (switchToRegister && loginForm && registerForm) {
    switchToRegister.addEventListener('click', () => {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    });
  }
  
  // 切换到登录表单
  if (switchToLogin && loginForm && registerForm) {
    switchToLogin.addEventListener('click', () => {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }
  
  // 退出登录按钮
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  return {
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  };
}

// 处理用户登录
function handleLogin() {
  const username = document.getElementById('login-username')?.value;
  const password = document.getElementById('login-password')?.value;
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  // 查找用户
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    isAdmin = user.isAdmin;
    
    // 隐藏错误消息
    if (loginError) {
      loginError.classList.add('hidden');
    }
    
    // 更新UI
    if (loginBtn && logoutBtn) {
      loginBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
    }
    
    // 关闭模态框
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.add('hidden');
    }
    
    // 显示成功消息
    alert('登录成功！欢迎回来，' + username);
    
    // 如果是管理员，显示管理员相关功能
    if (isAdmin) {
      showAdminFeatures();
    }
  } else {
    // 显示错误消息
    if (loginError) {
      loginError.classList.remove('hidden');
      loginError.textContent = '用户名或密码错误';
    }
  }
}

// 处理用户注册
function handleRegister() {
  const username = document.getElementById('register-username')?.value;
  const password = document.getElementById('register-password')?.value;
  const confirmPassword = document.getElementById('register-confirm-password')?.value;
  const registerError = document.getElementById('register-error');
  
  // 验证输入
  if (!username || !password || !confirmPassword) {
    if (registerError) {
      registerError.classList.remove('hidden');
      registerError.textContent = '请填写所有字段';
    }
    return;
  }
  
  if (password !== confirmPassword) {
    if (registerError) {
      registerError.classList.remove('hidden');
      registerError.textContent = '两次输入的密码不一致';
    }
    return;
  }
  
  // 检查用户名是否已存在
  if (mockUsers.find(u => u.username === username)) {
    if (registerError) {
      registerError.classList.remove('hidden');
      registerError.textContent = '用户名已存在';
    }
    return;
  }
  
  // 创建新用户
  const newUser = {
    id: mockUsers.length + 1,
    username: username,
    password: password,
    isAdmin: false
  };
  
  mockUsers.push(newUser);
  
  // 隐藏错误消息
  if (registerError) {
    registerError.classList.add('hidden');
  }
  
  // 切换回登录表单
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  if (loginForm && registerForm) {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }
  
  alert('注册成功！请使用新账号登录。');
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