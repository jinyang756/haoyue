/**
 * 表单验证工具模块 - 提供表单验证和错误处理功能
 * 作者: AI助手
 * 版本: 1.0
 * 日期: 2023-11-15
 */

/**
 * 表单验证器类
 */
export class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.validations = {};
    this.errors = {};
    this.isInitialized = false;
    
    if (!this.form) {
      console.warn(`Form with ID '${formId}' not found.`);
      return;
    }
  }
  
  /**
   * 添加验证规则
   * @param {string} fieldName - 字段名称
   * @param {Object} rules - 验证规则
   */
  addValidation(fieldName, rules) {
    this.validations[fieldName] = rules;
  }
  
  /**
   * 初始化表单验证
   * @returns {FormValidator} - 当前实例，支持链式调用
   */
  init() {
    if (!this.form || this.isInitialized) return this;
    
    // 为每个字段添加事件监听器
    Object.keys(this.validations).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`) || 
                    this.form.querySelector(`#${fieldName}`);
      
      if (field) {
        // 添加实时验证
        field.addEventListener('input', () => this.validateField(fieldName));
        field.addEventListener('blur', () => this.validateField(fieldName));
        
        // 添加键盘事件处理
        field.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const nextField = this.getNextField(field);
            if (nextField) {
              nextField.focus();
            } else {
              this.validateAll();
            }
          }
        });
      }
    });
    
    // 添加表单提交事件
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.validateAll()) {
        // 表单验证通过，可以提交
        const submitEvent = new CustomEvent('formValidated', {
          detail: { formData: this.getFormData() }
        });
        this.form.dispatchEvent(submitEvent);
      }
    });
    
    this.isInitialized = true;
    return this;
  }
  
  /**
   * 获取下一个表单字段
   * @param {HTMLElement} currentField - 当前字段
   * @returns {HTMLElement|null} - 下一个字段或null
   */
  getNextField(currentField) {
    const fields = Array.from(this.form.querySelectorAll('input, select, textarea'))
      .filter(field => !field.disabled && field.offsetParent !== null);
    
    const currentIndex = fields.indexOf(currentField);
    return currentIndex !== -1 && currentIndex < fields.length - 1 
      ? fields[currentIndex + 1] 
      : null;
  }
  
  /**
   * 验证单个字段
   * @param {string} fieldName - 字段名称
   * @returns {boolean} - 验证是否通过
   */
  validateField(fieldName) {
    const rules = this.validations[fieldName];
    const field = this.form.querySelector(`[name="${fieldName}"]`) || 
                  this.form.querySelector(`#${fieldName}`);
    
    if (!rules || !field) return true;
    
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // 必填验证
    if (rules.required && !value) {
      isValid = false;
      errorMessage = rules.requiredMessage || '此字段为必填项';
    }
    // 最小长度验证
    else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = rules.minLengthMessage || 
        `长度不能少于${rules.minLength}个字符`;
    }
    // 最大长度验证
    else if (rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = rules.maxLengthMessage || 
        `长度不能超过${rules.maxLength}个字符`;
    }
    // 正则表达式验证
    else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.patternMessage || '格式不正确';
    }
    // 自定义验证函数
    else if (rules.validator && typeof rules.validator === 'function') {
      const validationResult = rules.validator(value);
      if (validationResult !== true) {
        isValid = false;
        errorMessage = validationResult || '验证失败';
      }
    }
    
    // 更新错误状态
    if (isValid) {
      this.clearError(fieldName);
    } else {
      this.setError(fieldName, errorMessage);
    }
    
    return isValid;
  }
  
  /**
   * 验证所有字段
   * @returns {boolean} - 验证是否全部通过
   */
  validateAll() {
    let isValid = true;
    
    Object.keys(this.validations).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  /**
   * 设置字段错误
   * @param {string} fieldName - 字段名称
   * @param {string} errorMessage - 错误消息
   */
  setError(fieldName, errorMessage) {
    const field = this.form.querySelector(`[name="${fieldName}"]`) || 
                  this.form.querySelector(`#${fieldName}`);
    
    if (!field) return;
    
    // 存储错误
    this.errors[fieldName] = errorMessage;
    
    // 获取或创建错误显示元素
    let errorElement = this.form.querySelector(`#${fieldName}-error`);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = `${fieldName}-error`;
      errorElement.className = 'error-message text-red-500 text-sm mt-1';
      
      // 插入到字段后面
      field.parentNode.appendChild(errorElement);
    }
    
    // 设置错误消息并显示
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
    
    // 添加错误样式到字段
    field.classList.add('error-input');
    
    // 显示错误通知
    this.showErrorNotification(errorMessage);
  }
  
  /**
   * 清除字段错误
   * @param {string} fieldName - 字段名称
   */
  clearError(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`) || 
                  this.form.querySelector(`#${fieldName}`);
    
    if (!field) return;
    
    // 移除错误存储
    delete this.errors[fieldName];
    
    // 隐藏错误显示元素
    const errorElement = this.form.querySelector(`#${fieldName}-error`);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
    
    // 移除错误样式
    field.classList.remove('error-input');
  }
  
  /**
   * 获取表单数据
   * @returns {Object} - 表单数据对象
   */
  getFormData() {
    const formData = {};
    
    Object.keys(this.validations).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`) || 
                    this.form.querySelector(`#${fieldName}`);
      
      if (field) {
        formData[fieldName] = field.value.trim();
      }
    });
    
    return formData;
  }
  
  /**
   * 重置表单
   */
  reset() {
    if (!this.form) return;
    
    this.form.reset();
    
    // 清除所有错误
    Object.keys(this.errors).forEach(fieldName => {
      this.clearError(fieldName);
    });
    
    this.errors = {};
  }
  
  /**
   * 显示错误通知
   * @param {string} message - 错误消息
   */
  showErrorNotification(message) {
    // 创建一个临时的通知元素
    const notification = document.createElement('div');
    notification.className = 'notification-error fixed top-4 right-4 bg-red-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-500 opacity-0 translate-y-[-20px]';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.classList.remove('opacity-0', 'translate-y-[-20px]');
      notification.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    
    // 3秒后隐藏并移除通知
    setTimeout(() => {
      notification.classList.remove('opacity-100', 'translate-y-0');
      notification.classList.add('opacity-0', 'translate-y-[-20px]');
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
}

/**
 * 常用的验证规则
 */
export const ValidationRules = {
  // 用户名验证规则
  username: {
    required: true,
    requiredMessage: '请输入用户名',
    minLength: 3,
    minLengthMessage: '用户名长度不能少于3个字符',
    maxLength: 20,
    maxLengthMessage: '用户名长度不能超过20个字符',
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    patternMessage: '用户名只能包含字母、数字和下划线'
  },
  
  // 密码验证规则
  password: {
    required: true,
    requiredMessage: '请输入密码',
    minLength: 6,
    minLengthMessage: '密码长度不能少于6个字符',
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    patternMessage: '密码至少包含字母和数字'
  },
  
  // 邮箱验证规则
  email: {
    required: true,
    requiredMessage: '请输入邮箱地址',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: '请输入有效的邮箱地址'
  },
  
  // 手机号码验证规则
  phone: {
    required: true,
    requiredMessage: '请输入手机号码',
    pattern: /^1[3-9]\d{9}$/,
    patternMessage: '请输入有效的手机号码'
  },
  
  // 验证码验证规则
  verificationCode: {
    required: true,
    requiredMessage: '请输入验证码',
    pattern: /^\d{4,6}$/,
    patternMessage: '验证码格式不正确'
  }
};

/**
 * 初始化所有表单验证
 */
export function initFormValidations() {
  try {
    // 添加表单验证的基础样式
    addFormValidationStyles();
    
    console.log('表单验证功能初始化完成');
  } catch (error) {
    console.error('表单验证功能初始化失败:', error);
  }
}

/**
 * 添加表单验证的基础样式
 */
function addFormValidationStyles() {
  // 检查是否已经添加了样式
  if (document.getElementById('form-validation-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'form-validation-styles';
  style.textContent = `
    /* 错误输入样式 */
    .error-input {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
    
    /* 聚焦时的错误样式 */
    .error-input:focus {
      border-color: #ef4444;
      outline: none;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }
    
    /* 错误消息样式 */
    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      transition: opacity 0.3s ease;
    }
    
    /* 成功输入样式 */
    .success-input {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    
    /* 表单标签样式 */
    .form-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #e5e7eb;
    }
    
    /* 表单帮助文本样式 */
    .form-help {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }
    
    /* 表单组样式 */
    .form-group {
      margin-bottom: 1rem;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * 清理表单验证相关的元素
 */
export function cleanupFormValidations() {
  // 移除所有错误通知
  document.querySelectorAll('.notification-error').forEach(el => {
    el.remove();
  });
}