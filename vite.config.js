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
    // 启用rollup的持久化缓存
    cacheDir: '.vite-cache',
    // 配置rollup选项
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './test-admin.html'
      },
      // 代码分割配置
      output: {
        manualChunks: {
          // 将第三方库单独打包
          'vendors': ['chart.js'],
          // 将公共模块单独打包
          'common': ['src/js/utils/cacheService.js', 'src/js/utils/lazyLoad.js']
        },
        // 静态资源文件名添加哈希值，便于缓存控制
        assetFileNames: '[name]-[hash].[ext]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    // 开发服务器缓存
    cacheDir: '.vite-dev-cache'
  },
  // 优化依赖解析
  optimizeDeps: {
    include: ['chart.js'],
    // 启用依赖预构建缓存
    cacheDir: '.vite-optimize-cache'
  },
  // 预览服务器配置
  preview: {
    port: 8080,
    open: true,
    // 添加响应头以控制缓存
    headers: {
      'Cache-Control': 'public, max-age=604800, immutable'
    }
  }
});