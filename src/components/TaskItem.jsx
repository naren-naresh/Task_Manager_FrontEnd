import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleTask, deleteTask, editTask } from '../features/tasks/taskSlice.js';
import { Link } from 'react-router-dom';

const TaskItem = ({ task, provided }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const handleToggleStatus = () => {
    dispatch(toggleTask({
      ...task,
      status: task.status === 'pending' ? 'completed' : 'pending',
      lastModified: new Date().toISOString(),
    }));
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && (editTitle !== task.title || editDescription !== task.description)) {
      dispatch(editTask({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        lastModified: new Date().toISOString(),
      }));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task._id));
    }
  };

  return (
    <div className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-4 overflow-hidden w-full">
        {/* Custom Checkbox */}
        <button
          onClick={handleToggleStatus}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.status === 'completed'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-500 hover:border-indigo-500'
          }`}
        >
          {task.status === 'completed' && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Title & Inline Edit */}
        <div className="flex flex-col truncate w-full">
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full pr-4">
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Task title"
                className="w-full bg-transparent border-b-2 border-indigo-500 outline-none dark:text-white font-medium"
              />
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a description (optional)..."
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none dark:text-gray-300 text-sm"
              />
              <div className="flex gap-2 mt-1">
                <button onClick={handleSaveEdit} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <span
                onDoubleClick={() => setIsEditing(true)}
                className={`font-medium truncate transition-all cursor-text ${
                  task.status === 'completed'
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {task.title}
              </span>
              {task.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {task.description}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions: Edit, Delete & Drag Handle */}
      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-indigo-500 p-2 transition-colors"
            aria-label="Edit Task"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <Link
            to={`/task/${task._id}`}
            className="text-gray-400 hover:text-indigo-500 p-2 transition-colors"
            aria-label="View Details"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 p-2 transition-colors"
            aria-label="Delete Task"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div
            className="text-gray-400 p-2 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300"
            {...provided?.dragHandleProps}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;