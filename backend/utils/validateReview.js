import Joi from "joi";

export const validateServiceReview = (data) => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.integer": "Rating must be a whole number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating must be at most 5",
      "any.required": "Rating is required"
    }),
    comment: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Comment must be at least 10 characters long",
      "string.max": "Comment must be at most 1000 characters long",
      "any.required": "Comment is required"
    })
  });

  return schema.validate(data);
};

export const validateProviderReview = (data) => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.integer": "Rating must be a whole number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating must be at most 5",
      "any.required": "Rating is required"
    }),
    comment: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Comment must be at least 10 characters long",
      "string.max": "Comment must be at most 1000 characters long",
      "any.required": "Comment is required"
    })
  });

  return schema.validate(data);
};
