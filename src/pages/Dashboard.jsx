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
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    dispatch(getTasks());
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') subscribeToNotifications();
      });
    }
  }, [dispatch]);

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

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filterStatus === 'all' ? true : t.status === filterStatus)
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [tasks, filterStatus, searchQuery]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const filteredTaskIds = filteredTasks.map(t => t._id);
    dispatch(reorderTasks({
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
      filteredTaskIds
    }));
  };

  const handleNotificationClick = async () => {
    if (!('Notification' in window)) return alert("Browser does not support notifications.");
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') subscribeToNotifications();
    } else if (Notification.permission === 'granted') {
      subscribeToNotifications();
    } else {
      alert("Notifications are blocked in settings.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[80vh]">
      
      {/* Header & Controls */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
        
        {/* Responsive Grid for Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:w-64 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm transition-all"
          />
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button 
              onClick={handleNotificationClick}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors text-sm font-bold shadow-sm whitespace-nowrap"
            >
              🔔 Reminders
            </button>
          </div>
        </div>
      </header>

      {/* Unified Create Task Form */}
      <form onSubmit={handleCreateTask} className="mb-10 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-2 sm:gap-3 transition-shadow focus-within:shadow-md">
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full p-3 bg-transparent outline-none dark:text-white font-medium text-lg placeholder-gray-400"
          />
          <textarea
            placeholder="Add a description (optional)..."
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full p-3 pt-0 bg-transparent outline-none dark:text-gray-300 text-sm resize-none placeholder-gray-400/70"
            rows="1"
          />
        </div>
        <button 
          type="submit" 
          disabled={!newTaskTitle.trim()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all sm:self-stretch mt-2 sm:mt-0 shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          Add Task
        </button>
      </form>

      {/* Task List */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {filteredTasks.length === 0 && !isLoading && (
                  <div className="text-center text-gray-400 dark:text-gray-500 py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-lg font-medium">No tasks found.</p>
                    <p className="text-sm mt-1">Enjoy your free time!</p>
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