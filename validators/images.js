import * as yup from 'yup';

export const getAllImagesForEntitySchema = yup.object().shape({
  entityId: yup.string().typeError("Entity Id must be a string")
      .required("Entity Id is required"),
  entityCollection: yup.string().typeError("Entity Collection must be a string")
    .required("Entity Collection is required"),
});

export const deleteImageSchema = yup.object().shape({
  id: yup.string().typeError("Id must be a string")
      .required("Id is required"),
});

export const createImagesSchema = yup.object().shape({
  imageKeys: yup.array().typeError("Image Keys must be an Array")
    .required("Image Keys is required")
    .min(1, "Number of Images must be greater than 0"),
  entityId: yup.string().typeError("Entity Id must be a string")
      .required("Entity Id is required"),
  entityCollection: yup.string().typeError("Entity Collection must be a string")
    .required("Entity Collection is required"),
});