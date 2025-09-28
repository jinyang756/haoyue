/**
 * 平台介绍页面模块 - 实现关于皓月AI智能引擎的详细介绍
 */

/**
 * 初始化平台介绍页面
 */
export function initPlatformIntro() {
  console.log('平台介绍模块已加载');
  
  // 初始化导航标签切换
  initTabsNavigation();
  
  // 添加页面加载动画
  initPageAnimation();
  
  // 初始化团队介绍部分
  initTeamSection();
  
  // 初始化FAQ手风琴组件
  initFAQAccordion();
}

/**
 * 初始化导航标签切换
 */
function initTabsNavigation() {
  const tabButtons = document.querySelectorAll('.intro-tab-button');
  const tabContents = document.querySelectorAll('.intro-tab-content');
  
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
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

/**
 * 初始化团队介绍部分
 */
function initTeamSection() {
  const teamMembers = document.querySelectorAll('.team-member');
  
  teamMembers.forEach((member, index) => {
    // 添加延迟渐入动画
    member.style.opacity = '0';
    member.style.transform = 'translateY(20px)';
    member.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      member.style.opacity = '1';
      member.style.transform = 'translateY(0)';
    }, 300 + (index * 200));
    
    // 添加悬停效果
    member.addEventListener('mouseenter', () => {
      const socialLinks = member.querySelector('.social-links');
      if (socialLinks) {
        socialLinks.classList.remove('opacity-0', 'translate-y-2');
        socialLinks.classList.add('opacity-100', 'translate-y-0');
      }
    });
    
    member.addEventListener('mouseleave', () => {
      const socialLinks = member.querySelector('.social-links');
      if (socialLinks) {
        socialLinks.classList.remove('opacity-100', 'translate-y-0');
        socialLinks.classList.add('opacity-0', 'translate-y-2');
      }
    });
  });
}

/**
 * 初始化FAQ手风琴组件
 */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    
    if (question && answer && icon) {
      // 添加延迟渐入动画
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 200 + (index * 100));
      
      // 添加点击事件
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        if (isOpen) {
          // 关闭手风琴
          item.classList.remove('open');
          answer.style.maxHeight = '0';
          answer.style.paddingTop = '0';
          answer.style.paddingBottom = '0';
          icon.style.transform = 'rotate(0deg)';
        } else {
          // 打开手风琴
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.paddingTop = '1rem';
          answer.style.paddingBottom = '1rem';
          icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

/**
 * 初始化页面动画
 */
function initPageAnimation() {
  // 添加页面元素渐入效果
  const pageElements = document.querySelectorAll('.page-section#platform-intro-page .animate-fade-in');
  pageElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('opacity-100', 'translate-y-0');
      element.classList.remove('opacity-0', 'translate-y-4');
    }, 100 * index);
  });
  
  // 为主要标题添加打字机效果
  const mainTitle = document.getElementById('main-intro-title');
  if (mainTitle) {
    const originalText = mainTitle.textContent;
    mainTitle.textContent = '';
    
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < originalText.length) {
        mainTitle.textContent += originalText.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
  }
}