import * as yup from 'yup';

export const getShopSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
});

export const deleteShopSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
});

export const createShopSchema = yup.object().shape({
  name: yup.string().typeError("Name must be a string")
        .required("Name is required")
});

export const updateShopSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
  name: yup.string().typeError("Name must be a string")
        .required("Name is required")
});