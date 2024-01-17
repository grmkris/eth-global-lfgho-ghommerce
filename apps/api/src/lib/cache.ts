import { LRUCache } from "lru-cache";
import { cachified, CacheEntry } from "@epic-web/cachified";

/* lru cache is not part of this package but a simple non-persistent cache */
export const lruCache = new LRUCache<string, CacheEntry>({ max: 1000 });
