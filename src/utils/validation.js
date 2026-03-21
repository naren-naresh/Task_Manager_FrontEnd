import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
});

export const signupSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});