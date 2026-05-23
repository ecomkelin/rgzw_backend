class SimpleCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 默认5分钟过期时间
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * 设置缓存项
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 过期时间（毫秒），如果不传则使用默认值
   */
  set(key, value, ttl) {
    const expiration = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiration });
  }

  /**
   * 获取缓存项
   * @param {string} key - 缓存键
   * @returns {*} 缓存值，如果不存在或已过期则返回null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存项
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在且未过期
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在有效缓存
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取所有缓存键
   */
  keys() {
    // 清理过期的键并返回剩余的键
    const validKeys = [];
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() <= item.expiration) {
        validKeys.push(key);
      } else {
        this.cache.delete(key); // 清理过期项
      }
    }
    return validKeys;
  }
}

// 创建全局实例
const globalCache = new SimpleCache();

module.exports = globalCache;