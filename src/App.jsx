import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getMe, logout } from './features/auth/authSlice.js';
import { resetTasks } from './features/tasks/taskSlice.js';
import { dbService } from './services/indexedDB.js';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import TaskDetail from './pages/TaskDetail.jsx';
import { toast, Toaster } from 'react-hot-toast';
import { authService } from './features/auth/authService.js';

function App() {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  
  // FIX 1: Safely extract both user and isLoading from Redux
  const { user, isLoading } = useSelector((state) => state.auth);
  
  // FIX 2: Trigger getMe on boot
  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  // FIX 3: Network listeners MUST be above the early return
  useEffect(() => {
    const handleOnline = () => toast.success('You are back online! Syncing...');
    const handleOffline = () => toast.error('You are offline. Changes will save locally.');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // FIX 4: Safe early return prevents ReferenceError crash
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-indigo-600 font-bold animate-pulse text-xl">Verifying session...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout()); 
    dispatch(resetTasks()); 
    await dbService.clearAllData(); 
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      <Toaster position="bottom-right" />
      <Router>
        <nav className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <h1 className="text-xl md:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            TaskFlow <span className="text-xs font-semibold text-white bg-indigo-500 px-2 py-1 rounded-md align-middle ml-1">PWA</span>
          </h1>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {user && (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-sm font-medium dark:text-gray-200">
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/task/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;