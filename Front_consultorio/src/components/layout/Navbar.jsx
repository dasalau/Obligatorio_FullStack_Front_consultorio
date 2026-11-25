import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/auth.slice";
import { useState } from "react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeUserName =
    user?.nombre && user?.apellido
      ? `${user.nombre} ${user.apellido}`
      : user?.username || "-";

  const navItems = [
    { to: "/dashboard", label: "Inicio" },
    { to: "/turnos", label: "Turnos" },
    { to: "/pacientes", label: "Pacientes" },
    { to: "/especialidades", label: "Especialidades" },
    { to: "/reportes", label: "Reportes" },
  ];

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="app-navbar card border-0">
      <nav
        className="navbar navbar-expand-lg navbar-dark p-0 app-navbar-shell"
        aria-label="Navegacion principal"
      >
        <div className="container-fluid p-0">
          <div className="app-navbar-topbar">
            <div className="d-flex align-items-center gap-3 app-brand-row">
              <img
                src="/logo_cecilia_travieso_rpg.svg"
                alt="Logo Clinica de Fisioterapia CT"
                className="brand-mark brand-logo"
              />
              <div className="app-brand-block">
                <h5 className="mb-0">
                  <span className="app-brand-title-full">Clinica de Fisioterapia CT</span>
                  <span className="app-brand-title-short">Clinica CT</span>
                </h5>
                <p className="mb-0 app-brand-user">
                  Usuario activo:{" "}
                  <strong>{activeUserName}</strong>
                </p>
              </div>
            </div>

            <button
              className="navbar-toggler app-navbar-toggler"
              type="button"
              aria-label="Mostrar u ocultar menu"
              aria-controls="app-navbar-content"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div
            id="app-navbar-content"
            className={`collapse navbar-collapse app-navbar-collapse ${menuOpen ? "show" : ""}`}
          >
            <div className="ms-auto d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100 app-navbar-menu-wrap">
              <div className="app-mobile-panel-head d-lg-none">
                <span className="app-mobile-panel-kicker">Panel principal</span>
                <strong>{activeUserName}</strong>
              </div>

              <div className="nav-pills-wrap ms-lg-auto">
                <span className="app-mobile-section-label d-lg-none">
                  Navegación
                </span>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `nav-pill ${isActive ? "nav-pill-active" : ""}`
                    }
                  >
                    <span className="menu-link-title">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="app-mobile-divider d-lg-none" />

              <button
                type="button"
                className="btn btn-sm btn-light app-navbar-logout"
                onClick={handleLogout}
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
