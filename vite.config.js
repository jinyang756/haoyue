import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  // 优化静态资源处理
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.webp'],
  build: {
    outDir: 'dist',
    // 优化构建输出
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap（生产环境可选）
    sourcemap: false,
    // 配置rollup选项
    rollupOptions: {
      input: {
        main: './index.html'
      },
      // 简化的输出配置，适合Vercel免费计划
      output: {
        // 静态资源文件名添加哈希值，便于缓存控制
        assetFileNames: '[name]-[hash].[ext]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        // 配置manualChunks，实现更精细的代码分割
        manualChunks(id) {
          // 将第三方库单独打包
          if (id.includes('node_modules')) {
            // 将chart.js相关的包单独打包
            if (id.includes('chart.js')) {
              return 'vendor-chartjs';
            }
            // 将其他第三方库打包在一起
            return 'vendor-common';
          }
          
          // 按功能模块分割代码
          if (id.includes('/src/js/modules/pages/')) {
            // 将页面组件单独打包
            const match = id.match(/\/pages\/(.*?)Page\.js$/);
            if (match) {
              return `page-${match[1]}`;
            }
            return 'pages';
          }
          
          // 将工具函数单独打包
          if (id.includes('/src/js/utils/')) {
            // 性能相关的工具函数
            if (id.includes('performance') || id.includes('cache')) {
              return 'utils-performance';
            }
            // 图片相关的工具函数
            if (id.includes('image') || id.includes('responsive')) {
              return 'utils-image';
            }
            // 其他工具函数
            return 'utils-common';
          }
          
          // 将核心模块单独打包
          if (id.includes('/src/js/modules/')) {
            // 导航模块
            if (id.includes('navigation')) {
              return 'module-navigation';
            }
            // 图表模块
            if (id.includes('chart')) {
              return 'module-chart';
            }
            // 其他核心模块
            return 'modules-common';
          }
        }
      }
    },
    // 禁用空chunk生成
    emptyOutDir: true,
    chunkSizeWarningLimit: 400 // 增加chunk大小警告限制
  },
  server: {
    port: 3000,
    open: true,
    // 配置代理（如果需要）
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // 优化依赖解析
  optimizeDeps: {
    include: ['chart.js'],
    // 强制预构建某些依赖
    force: false,
    // 禁用依赖预构建的缓存
    // cacheDir: 'node_modules/.vite',
  },
  // 预览服务器配置
  preview: {
    port: 8080,
    open: true
  },
  // 插件配置
  plugins: [
    // 可以添加vite插件来进一步优化构建
  ]
});