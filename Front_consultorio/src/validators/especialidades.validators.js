import Joi from "joi";

export const especialidadSchema = Joi.object({
  nombre: Joi.string().trim().min(2).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "Minimo 2 caracteres",
    "any.required": "El nombre es obligatorio",
  }),
  descripcion: Joi.string().trim().min(3).required().messages({
    "string.empty": "La descripcion es obligatoria",
    "string.min": "Minimo 3 caracteres",
    "any.required": "La descripcion es obligatoria",
  }),
});