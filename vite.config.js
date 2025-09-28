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
        // 简化代码分割逻辑，避免生成空chunk
        manualChunks(id) {
          // 将第三方库单独打包
          if (id.includes('node_modules')) {
            return 'vendors';
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