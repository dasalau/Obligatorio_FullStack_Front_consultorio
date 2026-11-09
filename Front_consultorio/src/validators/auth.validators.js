import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Usuario obligatorio",
    "string.min": "Minimo 3 caracteres",
    "string.max": "Maximo 30 caracteres",
    "any.required": "Usuario obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Contrasena obligatoria",
    "string.min": "Minimo 6 caracteres",
    "any.required": "Contrasena obligatoria",
  }),
});

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Usuario obligatorio",
    "string.min": "Minimo 3 caracteres",
    "string.max": "Maximo 30 caracteres",
    "any.required": "Usuario obligatorio",
  }),
  nombre: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Nombre obligatorio",
    "string.min": "Minimo 2 caracteres",
    "string.max": "Maximo 50 caracteres",
    "any.required": "Nombre obligatorio",
  }),
  apellido: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Apellido obligatorio",
    "string.min": "Minimo 2 caracteres",
    "string.max": "Maximo 50 caracteres",
    "any.required": "Apellido obligatorio",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email obligatorio",
    "string.email": "Email invalido",
    "any.required": "Email obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Contrasena obligatoria",
    "string.min": "Minimo 6 caracteres",
    "any.required": "Contrasena obligatoria",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Las contrasenas no coinciden",
    "string.empty": "Confirmacion obligatoria",
    "any.required": "Confirmacion obligatoria",
  }),
});
