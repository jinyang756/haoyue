/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,vue,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // 蓝色，专业稳重，用于金融数据
        secondary: '#1F2937', // 深灰色，背景和分隔线
        accent: '#F97316', // 橙色，交互高亮元素
        charity: '#E25858', // 暖红色，体现公益温暖
        quant: '#3B82F6', // 青蓝色，科技感与智能感
        success: '#10B981', // 绿色，成功状态
        danger: '#EF4444', // 红色，危险状态
        warning: '#F59E0B', // 黄色，警告状态
        info: '#3B82F6', // 蓝色，信息状态
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(255, 255, 255, 0.05), 0 2px 4px -1px rgba(255, 255, 255, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(255, 255, 255, 0.08), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}