import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { getTasks, createTask, reorderTasks } from '../features/tasks/taskSlice.js';
import TaskItem from '../components/TaskItem.jsx';
import { subscribeToNotifications } from '../utils/pushNotifications';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

   useEffect(() => {
    // 1. Fetch tasks (now hits IDB then Backend)
    dispatch(getTasks());

    // 2. Initialize push notifications
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') subscribeToNotifications();
      });
    }
  }, [dispatch]);

  // Handle Task Creation (Offline-First)
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      _id: uuidv4(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      status: 'pending',
      orderIndex: tasks.length,
      lastModified: new Date().toISOString(),
      isDeleted: false
    };

    dispatch(createTask(newTask));
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  // Performant Filtering & Searching
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filterStatus === 'all' ? true : t.status === filterStatus)
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [tasks, filterStatus, searchQuery]);

  // Optimistic Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    // Pass the IDs of the currently filtered view to safely map them 
    // back to the global state inside the Thunk.
    const filteredTaskIds = filteredTasks.map(t => t._id);

    dispatch(reorderTasks({
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
      filteredTaskIds
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 min-h-[80vh] rounded-2xl shadow-sm">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        {/* Search & Filter Controls */}
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            onClick={subscribeToNotifications}
            className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors text-xs font-bold"
          >
            🔔 Enable Reminders
          </button>
        </div>
      </header>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white transition-all"
        />
        <textarea
          placeholder="Add a description (optional)..."
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white transition-all resize-none"
          rows="2"
        />
        <button 
          type="submit" 
          disabled={!newTaskTitle.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Add Task
        </button>
      </form>

      {isLoading && tasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading tasks...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {filteredTasks.length === 0 && !isLoading && (
                  <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                    No tasks found.
                  </div>
                )}
                {filteredTasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <TaskItem task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default Dashboard;