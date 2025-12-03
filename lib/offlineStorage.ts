
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LakkiDB extends DBSchema {
  products: { key: string; value: any };
  orders: { key: string; value: any };
  customers: { key: string; value: any };
  warehouses: { key: string; value: any };
  suppliers: { key: string; value: any };
  purchase_orders: { key: string; value: any };
  roles: { key: string; value: any };
  settings: { key: string; value: any };
  returns: { key: string; value: any };
  notifications: { key: string; value: any };
  transfer_logs: { key: string; value: any };
  cart: { key: string; value: any };
  user: { key: string; value: any };
}

const DB_NAME = 'lakki_phones_local_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LakkiDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LakkiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const stores = [
          'products', 'orders', 'customers', 'warehouses', 'suppliers', 
          'purchase_orders', 'roles', 'settings', 'returns', 'notifications', 
          'transfer_logs', 'cart', 'user'
        ];
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store as any)) {
            // Settings needs special handling if no ID exists, but we'll try to stick to ID
            db.createObjectStore(store as any, { keyPath: 'id' });
          }
        });
      },
    });
  }
  return dbPromise;
};

// Generic Adapter Interface
export interface StorageAdapter {
  get: <T>(table: string) => Promise<T[]>;
  set: <T>(table: string, data: T | T[]) => Promise<void>;
  clear: (table: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<void>;
}

// 1. IndexedDB Adapter
export const IndexedDBAdapter: StorageAdapter = {
  get: async <T>(table: string): Promise<T[]> => {
    const db = await initDB();
    const data = await db.getAll(table as any);
    // Ensure we return an array
    return (data || []) as T[];
  },
  set: async <T>(table: string, data: T | T[]) => {
    const db = await initDB();
    const tx = db.transaction(table as any, 'readwrite');
    const store = tx.objectStore(table as any);
    
    // Support both single item upsert and bulk array
    if (Array.isArray(data)) {
        for (const item of data) {
            // Ensure settings has an ID if missing
            const itemToSave = { ...item } as any;
            if (table === 'settings' && !itemToSave.id) {
                itemToSave.id = 'global_settings';
            }
            // Ensure ID exists for other tables if missing
            if (!itemToSave.id) itemToSave.id = `gen-${Date.now()}-${Math.random()}`;
            
            await store.put(itemToSave);
        }
    } else {
        const itemToSave = { ...data } as any;
        if (table === 'settings' && !itemToSave.id) {
            itemToSave.id = 'global_settings';
        }
        if (!itemToSave.id) itemToSave.id = `gen-${Date.now()}-${Math.random()}`;
        await store.put(itemToSave);
    }
    await tx.done;
  },
  clear: async (table: string) => {
    const db = await initDB();
    await db.clear(table as any);
  },
  exportData: async () => {
    const db = await initDB();
    const exportObj: any = {};
    const stores = [
        'products', 'orders', 'customers', 'warehouses', 'suppliers', 
        'purchase_orders', 'roles', 'settings', 'returns', 'notifications', 
        'transfer_logs'
    ];
    
    for (const storeName of stores) {
        exportObj[storeName] = await db.getAll(storeName as any);
    }
    return JSON.stringify(exportObj);
  },
  importData: async (jsonString: string) => {
      try {
          const data = JSON.parse(jsonString);
          const db = await initDB();
          
          for (const [storeName, items] of Object.entries(data)) {
              if (Array.isArray(items)) {
                  const tx = db.transaction(storeName as any, 'readwrite');
                  const store = tx.objectStore(storeName as any);
                  await store.clear(); // Wipe before import to avoid conflicts
                  for (const item of items) {
                      await store.put(item);
                  }
                  await tx.done;
              }
          }
      } catch (e) {
          console.error("Import failed:", e);
          throw e;
      }
  }
};

// 2. LocalStorage Adapter
export const LocalStorageAdapter: StorageAdapter = {
  get: async <T>(table: string): Promise<T[]> => {
    const key = `lumina_${table}`;
    const item = localStorage.getItem(key);
    if (!item) return [];
    try {
        const parsed = JSON.parse(item);
        // Special case: Settings are stored as a single object but interface expects array
        if (table === 'settings' && !Array.isArray(parsed)) {
            return [parsed] as unknown as T[];
        }
        // General safety: If we expect a collection but got a singleton/null, wrap or empty
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    } catch {
        return [];
    }
  },
  set: async <T>(table: string, data: T | T[]) => {
    const key = `lumina_${table}`;
    
    // Special handling for settings: Store as Object to maintain compatibility with ShopContext initialization
    if (table === 'settings' && !Array.isArray(data)) {
        localStorage.setItem(key, JSON.stringify(data));
        return;
    }

    if (Array.isArray(data)) {
        localStorage.setItem(key, JSON.stringify(data));
    } else {
        // Fetch existing data safely
        const rawExisting = await LocalStorageAdapter.get<any>(table);
        // Ensure it's an array
        const existing = Array.isArray(rawExisting) ? rawExisting : [];
        
        const dataId = (data as any).id;
        
        if (dataId) {
            // Safe findIndex
            const idx = existing.findIndex((e: any) => e.id === dataId);
            if (idx >= 0) existing[idx] = data;
            else existing.push(data);
        } else {
            // Fallback for items without ID
            existing.push(data);
        }
        localStorage.setItem(key, JSON.stringify(existing));
    }
  },
  clear: async (table: string) => {
    localStorage.removeItem(`lumina_${table}`);
  },
  exportData: async () => {
      const exportObj: any = {};
      const stores = [
        'products', 'orders', 'customers', 'warehouses', 'suppliers', 
        'purchase_orders', 'roles', 'settings', 'returns', 'notifications', 
        'transfer_logs'
      ];
      for (const storeName of stores) {
          const key = `lumina_${storeName}`;
          const item = localStorage.getItem(key);
          if (item) exportObj[storeName] = JSON.parse(item);
      }
      return JSON.stringify(exportObj);
  },
  importData: async (jsonString: string) => {
      const data = JSON.parse(jsonString);
      for (const [storeName, items] of Object.entries(data)) {
          localStorage.setItem(`lumina_${storeName}`, JSON.stringify(items));
      }
  }
};

export const getStorageEngine = (type: 'indexeddb' | 'localstorage'): StorageAdapter => {
    // Basic check if IndexedDB is available
    if (type === 'indexeddb' && typeof window !== 'undefined' && !window.indexedDB) {
        console.warn("IndexedDB not available, falling back to LocalStorage");
        return LocalStorageAdapter;
    }
    return type === 'indexeddb' ? IndexedDBAdapter : LocalStorageAdapter;
};
