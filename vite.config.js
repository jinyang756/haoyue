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
        entryFileNames: '[name]-[hash].js'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // 优化依赖解析
  optimizeDeps: {
    include: ['chart.js']
  },
  // 预览服务器配置
  preview: {
    port: 8080,
    open: true
  }
});