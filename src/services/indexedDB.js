import { openDB } from 'idb';

const DB_NAME = 'TaskManagerPWA';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const dbService = {
  async getAllTasks() {
    const db = await initDB();
    return db.getAll('tasks');
  },
  async putTask(task) {
    const db = await initDB();
    return db.put('tasks', task);
  },
  async deleteTask(id) {
    const db = await initDB();
    return db.delete('tasks', id);
  },
  
  // QUEUE SQUASHING LOGIC
  async addToSyncQueue(action) {
    const db = await initDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const allItems = await store.getAll();

    // If it's an UPDATE, check if an update for this task is already queued
    if (action.type === 'UPDATE') {
      const existing = allItems.find(item => item.type === 'UPDATE' && item.data._id === action.data._id);
      if (existing) {
        existing.data = action.data; // Overwrite with newest data
        existing.timestamp = Date.now();
        await store.put(existing);
        return tx.done;
      }
    }
    
    await store.add({ ...action, timestamp: Date.now() });
    await tx.done;
  },
  
  async getSyncQueue() {
    const db = await initDB();
    return db.getAll('sync_queue');
  },
  async clearSyncQueue() {
    const db = await initDB();
    await db.clear('sync_queue');
  },
  async clearAllData() { // Needed for clean Logout
    const db = await initDB();
    await db.clear('tasks');
    await db.clear('sync_queue');
  },
  async getActiveTasks() {
    const db = await initDB();
    const allTasks = await db.getAll('tasks');
    return allTasks.filter(task => !task.isDeleted);
  },
};