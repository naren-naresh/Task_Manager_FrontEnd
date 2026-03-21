import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { loginSchema } from '../utils/validation';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, isError, message } = useSelector((state) => state.auth);

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Welcome Back</h2>
      {isError && <p className="text-red-500 mb-4">{message}</p>}
      
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
          ) : null}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Password</label>
          <input
            name="password"
            type="password"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...formik.getFieldProps('password')} 
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
          ) : null}
        </div>
        
        {/* Password field and Submit button would follow same pattern */}
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Login
        </button>
      </form>
      <p className="mt-4 text-center dark:text-gray-400">
        Don't have an account? <Link to="/signup" className="text-indigo-500">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;