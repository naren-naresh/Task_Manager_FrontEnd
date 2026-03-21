import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { signupSchema } from '../utils/validation';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isSuccess, isError, message, isLoading } = useSelector(
    (state) => state.auth
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signupSchema,
    onSubmit: (values) => {
      // We don't need to send confirmPassword to the API
      const { email, password } = values;
      dispatch(register({ email, password }));
    },
  });

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, isSuccess, navigate, dispatch]);

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Start managing your tasks offline</p>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {message}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            className={`w-full p-3 border rounded-lg outline-none transition-all dark:bg-gray-700 dark:text-white ${
              formik.touched.email && formik.errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1 font-medium">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className={`w-full p-3 border rounded-lg outline-none transition-all dark:bg-gray-700 dark:text-white ${
              formik.touched.password && formik.errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('password')}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs mt-1 font-medium">{formik.errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            className={`w-full p-3 border rounded-lg outline-none transition-all dark:bg-gray-700 dark:text-white ${
              formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500'
            }`}
            {...formik.getFieldProps('confirmPassword')}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 font-medium">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default Signup;