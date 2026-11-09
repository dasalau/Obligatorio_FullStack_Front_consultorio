import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, registerUsuario } from "../features/auth/auth.slice";
import { registerSchema } from "../validators/auth.validators";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: joiResolver(registerSchema), mode: "onChange" });

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(registerUsuario(values));
    if (registerUsuario.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <div className="auth-brand">
            <img
              src="/logo_cecilia_travieso_rpg.svg"
              alt="Logo de la empresa"
              className="auth-brand-logo"
            />
            Clínica Fisioterapéutica CT
          </div>

          <div className="auth-hero-content">
            <span className="auth-kicker">Consultorio digital</span>
            <h1>Creá tu cuenta y empezá a trabajar con orden.</h1>
            <p>
              Administrá pacientes, turnos y evolución clínica desde una sola
              herramienta pensada para crecer con tu consultorio.
            </p>
          </div>

          <ul className="auth-points">
            <li>Agenda profesional por paciente y especialidad</li>
            <li>Seguimiento de evolución e historial</li>
            <li>Reportes para decisiones más claras</li>
          </ul>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-surface">
            <div className="auth-form-header">
              <span className="eyebrow">Registro</span>
              <h2>Crear cuenta</h2>
              <p>
                Completá tus datos para comenzar a gestionar tu consultorio.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="auth-form form-card"
            >
              <div className="form-field">
                <label htmlFor="register-username">Usuario</label>
                <input
                  id="register-username"
                  className="form-control"
                  type="text"
                  {...register("username")}
                />
                {errors.username && <small>{errors.username.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="register-nombre">Nombre</label>
                <input
                  id="register-nombre"
                  className="form-control"
                  type="text"
                  {...register("nombre")}
                />
                {errors.nombre && <small>{errors.nombre.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="register-apellido">Apellido</label>
                <input
                  id="register-apellido"
                  className="form-control"
                  type="text"
                  {...register("apellido")}
                />
                {errors.apellido && <small>{errors.apellido.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  className="form-control"
                  type="email"
                  {...register("email")}
                />
                {errors.email && <small>{errors.email.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="register-password">Contraseña</label>
                <input
                  id="register-password"
                  className="form-control"
                  type="password"
                  {...register("password")}
                />
                {errors.password && <small>{errors.password.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="register-confirmPassword">
                  Repetir contraseña
                </label>
                <input
                  id="register-confirmPassword"
                  className="form-control"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <small>{errors.confirmPassword.message}</small>
                )}
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn auth-submit w-100"
                type="submit"
                disabled={!isValid || loading}
              >
                {loading ? "Registrando..." : "Registrarme"}
              </button>
            </form>

            <p className="auth-foot">
              <span>Ya tenés cuenta?</span>
              <Link to="/login">Ingresá</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
