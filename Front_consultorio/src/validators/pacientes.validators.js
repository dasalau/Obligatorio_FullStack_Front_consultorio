import Joi from "joi";

export const pacienteSchema = Joi.object({
  nombre: Joi.string().trim().min(2).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "Minimo 2 caracteres",
    "any.required": "El nombre es obligatorio",
  }),
  apellido: Joi.string().trim().min(2).required().messages({
    "string.empty": "El apellido es obligatorio",
    "string.min": "Minimo 2 caracteres",
    "any.required": "El apellido es obligatorio",
  }),
  cedula: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.pattern.base": "Solo numeros",
      "string.empty": "La cedula es obligatoria",
      "any.required": "La cedula es obligatoria",
    }),
  telefono: Joi.string().trim().required().messages({
    "string.empty": "El telefono es obligatorio",
    "any.required": "El telefono es obligatorio",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).allow("").messages({
    "string.email": "Email invalido",
  }),
});