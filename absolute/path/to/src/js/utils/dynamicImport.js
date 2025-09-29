// 原代码
// export default {
//   importModule,
//   preloadModules,
//   preloadModulesByRoute,
//   loadImage,
//   importModules
// };

// 修复后代码
// 推荐导出方式
// 仅使用命名导出
export { 
  importModule, 
  preloadModules, 
  preloadModulesByRoute, 
  loadImage, 
  importModules 
};

// 或者仅使用默认导出
export default {
  importModule,
  preloadModules,
  preloadModulesByRoute,
  loadImage,
  importModules
};

// 优化后的代码
let module = {};

// 根据环境决定使用真实导入还是模拟导入
if (import.meta.env?.DEV) {
  // 开发环境使用模拟实现便于调试
  console.log('在开发环境中，返回模拟模块对象');
  module = {
    mock: true,
    modulePath: fullPath,
    loaded: true,
    timestamp: Date.now(),
    init: function() { console.log(`模拟初始化模块: ${fullPath}`); },
    destroy: function() { console.log(`模拟销毁模块: ${fullPath}`); }
  };
} else {
  // 生产环境使用真实的动态导入
  try {
    // 对于模块映射表中存在的路径，使用映射表中的函数
    if (moduleMap[fullPath]) {
      module = await moduleMap[fullPath]();
    } else {
      // 否则使用原生import()
      module = await import(fullPath);
    }
  } catch (error) {
    console.error('动态导入模块失败:', error);
    throw new Error(`无法加载模块: ${fullPath}`);
  }
}