import * as yup from 'yup';

export const getProductSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
});

export const deleteProductSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
});

export const createProductSchema = yup.object().shape({
  name: yup.string().typeError("Name must be a string")
        .required("Name is required"),
  price: yup.number().typeError("Price must be a number")
        .required("Price is required")
        .positive("Price must be positive"),
  quantity: yup.number().typeError("Quantity must be a number")
            .required("Quantity is required")
            .positive("Quantity must be positive")
            .integer("Quantity must be a whole number"),
});

export const updateProductSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
  name: yup.string().typeError("Name must be a string")
        .required("Name is required"),
  price: yup.number().typeError("Price must be a number")
        .required("Price is required")
        .positive("Price must be positive"),
  quantity: yup.number().typeError("Quantity must be a number")
            .required("Quantity is required")
            .positive("Quantity must be positive")
            .integer("Quantity must be a whole number"),
});