import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginUsuario } from "../features/auth/auth.slice";
import { loginSchema } from "../validators/auth.validators";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: joiResolver(loginSchema), mode: "onChange" });

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(loginUsuario(values));
    if (loginUsuario.fulfilled.match(result)) {
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
            <h1>Tu agenda, pacientes y seguimiento en un solo lugar.</h1>
            <p>
              Gestioná turnos, historial clínico y reportes con una experiencia
              más clara, rápida y profesional.
            </p>
          </div>

          <ul className="auth-points">
            <li>Turnos y agenda centralizada</li>
            <li>Historial de pacientes y evolución</li>
            <li>Reportes claros para cada día</li>
          </ul>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-surface">
            <div className="auth-form-header">
              <span className="eyebrow">Acceso</span>
              <h2>Ingresar</h2>
              <p>Ingresá a tu consultorio y continuá con la gestión.</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="auth-form form-card"
            >
              <div className="form-field">
                <label htmlFor="login-username">Usuario</label>
                <input
                  id="login-username"
                  className="form-control"
                  type="text"
                  {...register("username")}
                />
                {errors.username && <small>{errors.username.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="login-password">Contraseña</label>
                <input
                  id="login-password"
                  className="form-control"
                  type="password"
                  {...register("password")}
                />
                {errors.password && <small>{errors.password.message}</small>}
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn auth-submit w-100"
                type="submit"
                disabled={!isValid || loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <p className="auth-foot">
              <span>No tenés cuenta?</span>
              <Link to="/register">Registrate</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
