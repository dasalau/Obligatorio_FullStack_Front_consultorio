import Joi from "joi";

export const horasDisponibles = Array.from({ length: 10 }, (_, index) => {
  const hour = 8 + index;
  return `${String(hour).padStart(2, "0")}:00`;
});

export const estadosTurnos = [
  "pendiente",
  "confirmado",
  "cancelado",
  "atendido",
];

export const turnoSchema = Joi.object({
  fecha: Joi.string().required().messages({
    "string.empty": "La fecha es obligatoria",
    "any.required": "La fecha es obligatoria",
  }),
  hora: Joi.string()
    .valid(...horasDisponibles)
    .required()
    .messages({
      "any.only": "La hora debe estar entre 08:00 y 17:00 en punto",
      "string.empty": "La hora es obligatoria",
      "any.required": "La hora es obligatoria",
    }),
  motivo: Joi.string().trim().min(5).required().messages({
    "string.min": "El motivo debe tener al menos 5 caracteres",
    "string.empty": "El motivo es obligatorio",
    "any.required": "El motivo es obligatorio",
  }),
  estado: Joi.string()
    .valid(...estadosTurnos)
    .messages({
      "any.only": "Estado invalido",
    }),
  paciente: Joi.string().required().messages({
    "string.empty": "El paciente es obligatorio",
    "any.required": "El paciente es obligatorio",
  }),
  especialidad: Joi.string().required().messages({
    "string.empty": "La especialidad es obligatoria",
    "any.required": "La especialidad es obligatoria",
  }),
  imagen: Joi.string().allow(""),
});
