import { dbService } from './indexedDB.js';
import { taskService } from '../features/tasks/taskService.js';
import { updateTasksFromSync } from '../features/tasks/taskSlice.js';
import { store } from '../app/store.js';

export const initSyncManager = () => {
  window.addEventListener('online', async () => {
    console.log('[SyncManager] Back online. Processing queue...');
    await processSyncQueue();
  });
};

const processSyncQueue = async () => {
  const queue = await dbService.getSyncQueue();
  
  if (queue.length === 0) return;

  try {
    // Collect all tasks that need syncing
    const tasksToSync = await dbService.getAllTasks();
    
    // Call the bulk sync endpoint we built in Phase 3
    const updatedTasks = await taskService.syncTasks(tasksToSync);

    // Update local IDB with server's reconciled version
    for (const task of updatedTasks) {
      await dbService.putTask(task);
    }

    // Clear the queue and update Redux
    await dbService.clearSyncQueue();
    store.dispatch(updateTasksFromSync(updatedTasks));
    
    console.log('[SyncManager] Sync completed successfully.');
  } catch (error) {
    console.error('[SyncManager] Sync failed:', error);
  }
};