import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { loginSchema } from '../utils/validation';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, isError, message, isLoading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
      dispatch(reset());
    }
  }, [isSuccess, navigate, dispatch]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your offline-first tasks
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          
          {isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm font-medium rounded-r-lg">
              {message}
            </div>
          )}
          
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all bg-gray-50 dark:bg-gray-700/50 dark:text-white ${
                  formik.touched.email && formik.errors.email 
                    ? 'border-red-500 ring-1 ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:border-transparent'
                }`}
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all bg-gray-50 dark:bg-gray-700/50 dark:text-white ${
                  formik.touched.password && formik.errors.password 
                    ? 'border-red-500 ring-1 ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:border-transparent'
                }`}
                {...formik.getFieldProps('password')} 
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{formik.errors.password}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;