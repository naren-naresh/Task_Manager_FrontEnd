import { dbService } from './indexedDB.js';
import { taskService } from '../features/tasks/taskService.js';
import { updateTasksFromSync } from '../features/tasks/taskSlice.js';
import { store } from '../app/store.js';
import { toast } from 'react-hot-toast';

export const initSyncManager = () => {
  window.addEventListener('online', async () => {
    toast.loading('Network restored. Syncing...', { id: 'sync-toast' });
    await processSyncQueue();
  });
};

const processSyncQueue = async () => {
  const queue = await dbService.getSyncQueue();
  
  if (queue.length === 0) {
    toast.dismiss('sync-toast');
    return;
  }

  try {
    const tasksToSync = await dbService.getAllTasks();
    const updatedTasks = await taskService.syncTasks(tasksToSync);

    // ATOMIC UPDATE: Only clear queue AFTER successful server response and IDB update
    for (const task of updatedTasks) {
      await dbService.putTask(task);
    }

    await dbService.clearSyncQueue();
    store.dispatch(updateTasksFromSync(updatedTasks));
    
    toast.success('All tasks synced successfully!', { id: 'sync-toast' });
  } catch (error) {
    // If auth fails (401), the interceptor handles it, but we MUST NOT clear the queue
    toast.error('Sync failed. Will retry later.', { id: 'sync-toast' });
    console.error('[SyncManager] Sync failed:', error);
  }
};