import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  email: yup.string().typeError('Email must be a string')
    .required("Email is required")
    .email("Email is not valid"),
  password: yup.string().typeError('Email must be a string')
    .required("Password is required")
    .min(8, `Password must be at least 8 characters long`)
});