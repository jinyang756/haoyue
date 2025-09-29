import { defineConfig } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// 配置插件
const plugins = []

// 在生产环境启用图片优化
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      svg: { multipass: true },
    })
  )
}

export default defineConfig({
  root: '.',
  // 优化静态资源处理
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.webp'],
  plugins: plugins,
  build: {
    outDir: 'dist',
    // 优化构建输出
    minify: 'terser',
    terserOptions: {
      compress: {
          // 激进的压缩选项
          dead_code: true,
          drop_console: true,
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          unused: true,
        },
      format: {
        comments: false,
        // 更紧凑的输出格式
        beautify: false,
        safari10: true,
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
        // 改进的代码分割逻辑
        manualChunks(id) {
          // 将第三方库按功能分开打包
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) {
              return 'vendor-chartjs'
            }
            if (id.includes('@flags-sdk/statsig')) {
              return 'vendor-statsig'
            }
            return 'vendors'
          }
          // 按功能模块分割项目代码
          if (id.includes('modules/charts')) {
            return 'app-charts'
          }
          if (id.includes('modules/auth')) {
            return 'app-auth'
          }
          if (id.includes('modules/blackhole')) {
            return 'app-blackhole'
          }
        }
      },
      // 禁用不必要的模块导出
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
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
  }
});