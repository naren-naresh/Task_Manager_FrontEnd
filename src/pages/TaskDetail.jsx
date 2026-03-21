import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { editTask } from '../features/tasks/taskSlice.js';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { tasks } = useSelector((state) => state.tasks);
  const task = tasks.find((t) => t._id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(editTask({
      ...task,
      title,
      description,
      lastModified: new Date().toISOString()
    }));
    navigate('/');
  };

  if (!task) return <div className="text-center py-10 dark:text-white">Task not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
      <button onClick={() => navigate('/')} className="mb-4 text-indigo-500 hover:underline">← Back to Dashboard</button>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Edit Task Details</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Title</label>
          <input
            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description</label>
          <textarea
            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default TaskDetail;