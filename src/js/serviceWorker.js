/**
 * Service Worker - 提供离线访问和资源缓存功能
 */

// 缓存版本和名称
const CACHE_VERSION = 'v2.0';
const CACHE_NAME = `haoyue-cache-${CACHE_VERSION}`;
// 图片特定缓存
const IMAGE_CACHE_NAME = `haoyue-image-cache-${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/js/main.js',
  '/src/js/utils/cacheService.js',
  '/src/js/utils/lazyLoad.js',
  '/src/js/modules/navigation.js',
  '/src/js/modules/authModule.js',
  // 添加其他重要的静态资源
];

// 运行时缓存的URL模式
const RUNTIME_CACHE_PATTERNS = [
  /\/api\//,
  /\.json$/,
  // 其他需要缓存的资源模式
];

// 图片缓存模式
const IMAGE_CACHE_PATTERNS = [
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
  /\.avif$/,
];

// 图片缓存策略配置
const IMAGE_CACHE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  maxSize: 100, // 最多缓存100张图片
  priority: {
    '/favicon.ico': 5,
    '/logo.png': 5,
    '/src/assets/images/': 3
  }
};

/**
 * 安装Service Worker
 */
self.addEventListener('install', (event) => {
  // 跳过等待，直接激活
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: 缓存静态资源');
          return cache.addAll(STATIC_ASSETS);
        })
        .catch(error => {
          console.error('Service Worker: 缓存静态资源失败:', error);
        }),
      // 创建图片缓存
      caches.open(IMAGE_CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: 创建图片缓存');
          return cache;
        })
        .catch(error => {
          console.error('Service Worker: 创建图片缓存失败:', error);
        })
    ])
  );
});

/**
 * 激活Service Worker
 */
self.addEventListener('activate', (event) => {
  // 清理旧缓存
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME && 
                (cacheName.startsWith('haoyue-cache-') || cacheName.startsWith('haoyue-image-cache-'))) {
              console.log('Service Worker: 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 接管所有客户端
        return self.clients.claim();
      })
  );
});

/**
 * 拦截网络请求
 */
self.addEventListener('fetch', (event) => {
  // 对于某些特殊请求，不进行缓存处理
  if (shouldBypassCache(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 对于GET请求，尝试从缓存获取，否则直接请求
  if (event.request.method === 'GET') {
    // 图片请求特殊处理
    if (isImageRequest(event.request)) {
      event.respondWith(handleImageRequest(event.request));
      return;
    }
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // 缓存命中，直接返回
          if (response) {
            console.log('Service Worker: 从缓存返回:', event.request.url);
            return response;
          }
          
          // 缓存未命中，发起网络请求
          return fetch(event.request)
            .then(networkResponse => {
              // 对于符合缓存模式的响应，存入缓存
              if (shouldCacheResponse(event.request, networkResponse)) {
                return cacheNetworkResponse(event.request, networkResponse);
              }
              return networkResponse;
            })
            .catch(error => {
              console.error('Service Worker: 网络请求失败:', error);
              // 返回一个友好的离线页面（如果有）
              return getFallbackResponse(event.request);
            });
        })
    );
  } else {
    // 对于非GET请求，直接发起网络请求
    event.respondWith(fetch(event.request));
  }
});

/**
 * 检查请求是否为图片请求
 */
function isImageRequest(request) {
  const url = request.url;
  for (const pattern of IMAGE_CACHE_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  return false;
}

/**
 * 处理图片请求
 */
function handleImageRequest(request) {
  // 尝试从图片缓存获取
  return caches.match(request, { cacheName: IMAGE_CACHE_NAME })
    .then(cachedResponse => {
      if (cachedResponse) {
        const timestamp = parseInt(cachedResponse.headers.get('X-Cache-Timestamp') || 0);
        const maxAge = parseInt(cachedResponse.headers.get('X-Cache-Max-Age') || IMAGE_CACHE_CONFIG.maxAge);
        
        // 检查缓存是否过期
        if (Date.now() - timestamp < maxAge) {
          console.log('Service Worker: 从图片缓存返回:', request.url);
          // 后台异步更新图片（如果需要）
          updateImageCache(request);
          return cachedResponse;
        } else {
          // 缓存已过期，删除旧缓存
          caches.open(IMAGE_CACHE_NAME)
            .then(cache => cache.delete(request));
        }
      }
      
      // 缓存中没有或已过期，请求网络
      return fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            // 克隆响应
            const responseToCache = networkResponse.clone();
            
            // 缓存图片响应
            caches.open(IMAGE_CACHE_NAME)
              .then(cache => {
                // 添加时间戳元数据
                const cacheControl = networkResponse.headers.get('Cache-Control') || '';
                const maxAge = parseMaxAge(cacheControl) || IMAGE_CACHE_CONFIG.maxAge;
                
                // 创建带有时间戳的响应
                addTimestampToResponse(responseToCache, maxAge)
                  .then(timestampedResponse => {
                    cache.put(request, timestampedResponse);
                    // 检查并清理图片缓存
                    cleanupImageCache();
                  });
              });
          }
          
          return networkResponse;
        })
        .catch(error => {
          console.error('Service Worker: 图片请求失败:', error);
          // 返回一个占位SVG图片作为回退
          return getFallbackResponse(request);
        });
    });
}

/**
 * 异步更新图片缓存
 */
function updateImageCache(request) {
  // 只在用户闲置时更新图片缓存
  if ('requestIdleCallback' in self) {
    self.requestIdleCallback(() => {
      fetch(request, { cache: 'reload' })
        .then(freshResponse => {
          if (freshResponse.ok) {
            caches.open(IMAGE_CACHE_NAME)
              .then(cache => {
                const responseToCache = freshResponse.clone();
                addTimestampToResponse(responseToCache, IMAGE_CACHE_CONFIG.maxAge)
                  .then(timestampedResponse => {
                    cache.put(request, timestampedResponse);
                  });
              });
          }
        })
        .catch(() => {}); // 忽略更新失败
    }, { timeout: 5000 });
  }
}

/**
 * 清理图片缓存，保持在大小限制内
 */
function cleanupImageCache() {
  caches.open(IMAGE_CACHE_NAME)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > IMAGE_CACHE_CONFIG.maxSize) {
            // 获取所有缓存项及其时间戳
            const cacheItems = [];
            
            Promise.all(
              keys.map(key => {
                return cache.match(key)
                  .then(response => {
                    if (response) {
                      return response.headers.get('X-Cache-Timestamp') || 0;
                    }
                    return 0;
                  })
                  .then(timestamp => {
                    // 计算优先级
                    let priority = 1;
                    for (const pattern in IMAGE_CACHE_CONFIG.priority) {
                      if (key.url.includes(pattern)) {
                        priority = IMAGE_CACHE_CONFIG.priority[pattern];
                        break;
                      }
                    }
                    
                    cacheItems.push({ key, timestamp: parseInt(timestamp), priority });
                  });
              })
            ).then(() => {
              // 按优先级和时间戳排序（优先级高的、较新的排在后面）
              cacheItems.sort((a, b) => {
                if (a.priority !== b.priority) {
                  return b.priority - a.priority;
                }
                return b.timestamp - a.timestamp;
              });
              
              // 删除超过限制的旧缓存
              const itemsToDelete = cacheItems.slice(IMAGE_CACHE_CONFIG.maxSize);
              itemsToDelete.forEach(item => {
                cache.delete(item.key);
              });
              
              console.log(`Service Worker: 清理了 ${itemsToDelete.length} 个旧图片缓存项`);
            });
          }
        });
    });
}

/**
 * 解析Cache-Control中的max-age值
 */
function parseMaxAge(cacheControl) {
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  return maxAgeMatch ? parseInt(maxAgeMatch[1]) * 1000 : null;
}

/**
 * 为响应添加时间戳
 */
function addTimestampToResponse(response, maxAge) {
  return response.blob()
    .then(blob => {
      const headers = new Headers(response.headers);
      headers.set('X-Cache-Timestamp', Date.now().toString());
      headers.set('X-Cache-Max-Age', maxAge.toString());
      
      return new Response(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
    });
}

/**
 * 判断是否应该绕过缓存
 * @param {Request} request - 请求对象
 * @returns {boolean} - 是否绕过缓存
 */
function shouldBypassCache(request) {
  // 对于某些特定的请求，如带有时间戳的请求，不进行缓存
  const url = request.url;
  return url.includes('/api/auth/') || 
         url.includes('/api/upload/') ||
         url.includes('?nocache=1') ||
         url.includes('timestamp=');
}

/**
 * 判断是否应该缓存响应
 * @param {Request} request - 请求对象
 * @param {Response} response - 响应对象
 * @returns {boolean} - 是否缓存响应
 */
function shouldCacheResponse(request, response) {
  // 只缓存成功的响应
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return false;
  }
  
  const url = request.url;
  
  // 检查是否匹配运行时缓存模式
  for (const pattern of RUNTIME_CACHE_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // 图片请求已经在handleImageRequest中处理
  return false;
}

/**
 * 缓存网络响应
 * @param {Request} request - 请求对象
 * @param {Response} response - 响应对象
 * @returns {Promise<Response>} - 返回响应的Promise
 */
function cacheNetworkResponse(request, response) {
  // 克隆响应，因为响应流只能读取一次
  const responseToCache = response.clone();
  
  caches.open(CACHE_NAME)
    .then(cache => {
      console.log('Service Worker: 缓存网络响应:', request.url);
      cache.put(request, responseToCache);
    })
    .catch(error => {
      console.error('Service Worker: 缓存网络响应失败:', error);
    });
  
  return response;
}

/**
 * 获取回退响应
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} - 返回回退响应的Promise
 */
function getFallbackResponse(request) {
  const url = request.url;
  
  // 针对不同类型的请求返回不同的回退响应
  if (url.endsWith('.html')) {
    return caches.match('/offline.html');
  } else if (/\.(png|jpg|jpeg|gif|svg|webp|avif)$/.test(url)) {
    // 返回默认的图片占位符
    return new Response(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      {
        headers: {
          'Content-Type': 'image/png'
        },
        status: 200,
        statusText: 'OK'
      }
    );
  } else if (url.includes('/api/')) {
    // 返回空的JSON响应
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 503,
        statusText: 'Service Unavailable'
      }
    );
  }
  
  // 返回默认的离线页面
  return caches.match('/index.html');
}

/**
 * 监听消息事件
 */
self.addEventListener('message', (event) => {
  // 处理来自客户端的消息
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_ASSET') {
    // 缓存指定的资源
    if (event.data.url) {
      caches.open(CACHE_NAME)
        .then(cache => {
          cache.add(event.data.url);
        });
    }
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    // 清除缓存
    caches.delete(CACHE_NAME);
  }
});

/**
 * 监听后台同步事件
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: 后台同步事件:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * 同步数据到服务器
 * @returns {Promise<void>} - 同步操作完成的Promise
 */
async function syncData() {
  try {
    // 从IndexedDB获取待同步的数据
    const dataToSync = await getDataToSync();
    
    if (dataToSync.length > 0) {
      // 执行同步操作
      for (const data of dataToSync) {
        await fetch(data.url, {
          method: data.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...data.headers
          },
          body: JSON.stringify(data.body)
        });
        
        // 同步成功后，删除待同步数据
        await removeSyncedData(data.id);
      }
      
      console.log('Service Worker: 数据同步成功');
    }
  } catch (error) {
    console.error('Service Worker: 数据同步失败:', error);
    throw error;
  }
}

/**
 * 获取待同步的数据
 * @returns {Promise<Array>} - 待同步数据的Promise
 */
function getDataToSync() {
  // 这里应该实现从IndexedDB获取待同步数据的逻辑
  // 为了简化，返回一个空数组
  return Promise.resolve([]);
}

/**
 * 移除已同步的数据
 * @param {string} id - 数据ID
 * @returns {Promise<void>} - 移除操作完成的Promise
 */
function removeSyncedData(id) {
  // 这里应该实现从IndexedDB移除已同步数据的逻辑
  // 为了简化，返回一个已解析的Promise
  return Promise.resolve();
}

// 导出self对象，便于测试和TypeScript类型检查
export default self;