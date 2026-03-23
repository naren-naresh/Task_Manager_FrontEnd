import { dbService } from './indexedDB.js';
import { taskService } from '../features/tasks/taskService.js';
import { getTasks, updateTasksFromSync } from '../features/tasks/taskSlice.js';
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
    //  STEP 1: Load all tasks once (single DB read)
    const allTasks = await dbService.getAllTasks();

    //  STEP 2: O(1) lookup map (performance boost)
    const taskLookup = new Map(allTasks.map(task => [task._id, task]));

    //  STEP 3: Deduplicate using Map (latest action wins)
    const tasksToSyncMap = new Map();

    for (const action of queue) {
      const taskId = action?.data?._id;
      if (!taskId) continue;

      const fullTask = taskLookup.get(taskId);

      // Skip if task not found (edge case safety)
      if (!fullTask) continue;

      // Always store FULL task (fixes validation issue)
      tasksToSyncMap.set(taskId, fullTask);
    }

    const tasksToSync = Array.from(tasksToSyncMap.values());

    //  Debug (remove in production)
    console.log('[SYNC PAYLOAD]', tasksToSync);

    if (tasksToSync.length === 0) {
      toast.dismiss('sync-toast');
      return;
    }

    //  STEP 4: Send to backend
    const updatedTasks = await taskService.syncTasks(tasksToSync);

    //  STEP 5: Batch update IndexedDB (parallel for speed)
    await Promise.all(
      updatedTasks.map(task => dbService.putTask(task))
    );

    //  STEP 6: Clear queue ONLY after success
    await dbService.clearSyncQueue();

    //  STEP 7: Update Redux
    store.dispatch(updateTasksFromSync(updatedTasks));


    // Fetch fresh data from backend
    await store.dispatch(getTasks());


    toast.success('All tasks synced successfully!', { id: 'sync-toast' });

  } catch (error) {
    toast.error('Sync failed. Will retry later.', { id: 'sync-toast' });
    console.error('[SyncManager] Sync failed:', error);
  }
};