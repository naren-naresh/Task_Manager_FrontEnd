import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dbService } from '../../services/indexedDB.js'; // Adjust path if needed based on your folder structure
import { taskService } from './taskService.js'; // Adjust path if needed

// --- THUNKS ---

// Toggle Task Status
export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async (updatedTask, { rejectWithValue }) => {
    try {
      await dbService.putTask(updatedTask);
      if (navigator.onLine) {
        try {
          await taskService.updateTask(updatedTask._id, updatedTask);
        } catch (error) {
          await dbService.addToSyncQueue({ type: 'UPDATE', data: updatedTask });
        }
      } else {
        await dbService.addToSyncQueue({ type: 'UPDATE', data: updatedTask });
      }
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// src/features/tasks/taskSlice.js

export const getTasks = createAsyncThunk(
  'tasks/getTasks',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Fetch from local IndexedDB for instant UI load
      const localTasks = await dbService.getAllTasks();
      let activeTasks = localTasks.filter(task => !task.isDeleted);

      // 2. If online, fetch fresh tasks from the backend
      if (navigator.onLine) {
        try {
          const serverTasks = await taskService.getTasks();
          
          // 3. Save fresh server tasks to local IDB so it's ready for offline
          for (const task of serverTasks) {
            await dbService.putTask(task);
          }
          
          // Use the fresh server tasks (Backend already filters isDeleted: false)
          activeTasks = serverTasks;
        } catch (apiError) {
          console.error('API fetch failed, falling back to local storage', apiError);
        }
      }

      // Sort by orderIndex to maintain Drag & Drop state
      return activeTasks.sort((a, b) => a.orderIndex - b.orderIndex);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Create Task (Optimistic)
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (newTask, { rejectWithValue }) => {
    try {
      await dbService.putTask(newTask);
      if (navigator.onLine) {
        try {
          await taskService.createTask(newTask);
        } catch (error) {
          await dbService.addToSyncQueue({ type: 'CREATE', data: newTask });
        }
      } else {
        await dbService.addToSyncQueue({ type: 'CREATE', data: newTask });
      }
      return newTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Edit Task Title
export const editTask = createAsyncThunk(
  'tasks/editTask',
  async (updatedTask, { rejectWithValue }) => {
    try {
      await dbService.putTask(updatedTask);
      if (navigator.onLine) {
        try {
          await taskService.updateTask(updatedTask._id, updatedTask);
        } catch (error) {
          await dbService.addToSyncQueue({ type: 'UPDATE', data: updatedTask });
        }
      } else {
        await dbService.addToSyncQueue({ type: 'UPDATE', data: updatedTask });
      }
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reorder Tasks (Fixes the Drag & Drop Data Loss)
export const reorderTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async ({ sourceIndex, destinationIndex, filteredTaskIds }, { getState, rejectWithValue }) => {
    try {
      const { tasks } = getState().tasks;
      const newTasks = [...tasks];
      
      const sourceId = filteredTaskIds[sourceIndex];
      const destId = filteredTaskIds[destinationIndex];
      
      const globalSourceIndex = newTasks.findIndex(t => t._id === sourceId);
      const globalDestIndex = newTasks.findIndex(t => t._id === destId);

      const [reorderedItem] = newTasks.splice(globalSourceIndex, 1);
      newTasks.splice(globalDestIndex, 0, reorderedItem);

      const reindexedTasks = newTasks.map((task, index) => ({
        ...task,
        orderIndex: index,
        lastModified: new Date().toISOString()
      }));

      // Assuming you have a bulk update method in your DB service
      if (dbService.bulkPutTasks) {
         await dbService.bulkPutTasks(reindexedTasks);
      }
      
      return reindexedTasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete Task (Assuming you already had something like this, keeping it for the component)
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await dbService.deleteTask(taskId);
      if (navigator.onLine) {
        try { await taskService.deleteTask(taskId); } 
        catch (e) { await dbService.addToSyncQueue({ type: 'DELETE', data: { _id: taskId } }); }
      } else {
        await dbService.addToSyncQueue({ type: 'DELETE', data: { _id: taskId } });
      }
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// --- SLICE ---
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    updateTasksFromSync: (state, action) => {
      state.tasks = action.payload;
    },
    resetTasks: (state) => {
      state.tasks = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
     .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload || []; // Fallback to empty array
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTask.pending, (state, action) => {
        // Optimistically add the task to the top or bottom of the list
        state.tasks.push(action.meta.arg); 
      })
      // Optimistic updates for toggling and editing
      .addCase(toggleTask.pending, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.meta.arg._id);
        if (index !== -1) state.tasks[index] = action.meta.arg;
      })
      .addCase(editTask.pending, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.meta.arg._id);
        if (index !== -1) state.tasks[index] = action.meta.arg;
      })
      .addCase(reorderTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(deleteTask.pending, (state, action) => {
        // Optimistically remove from UI
        state.tasks = state.tasks.filter(t => t._id !== action.meta.arg);
      });
  },
});

export const { updateTasksFromSync,resetTasks } = taskSlice.actions;
export default taskSlice.reducer;