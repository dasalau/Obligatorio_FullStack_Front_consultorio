import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/auth.slice";
import { useState } from "react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Inicio" },
    { to: "/turnos", label: "Turnos" },
    { to: "/pacientes", label: "Pacientes" },
    { to: "/especialidades", label: "Especialidades" },
    { to: "/reportes", label: "Reportes" },
  ];

  const handleLogout = () => {
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
          <div className="d-flex align-items-center gap-3">
            <img
              src="/logo_cecilia_travieso_rpg.svg"
              alt="Logo Clinica de Fisioterapia CT"
              className="brand-mark brand-logo"
            />
            <div>
              <h5 className="mb-0">Clinica de Fisioterapia CT</h5>
              <p className="mb-0 text-light-emphasis">
                Usuario activo:{" "}
                <strong>
                  {user?.nombre && user?.apellido
                    ? `${user.nombre} ${user.apellido}`
                    : user?.username || "-"}
                </strong>
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

          <div
            id="app-navbar-content"
            className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          >
            <div className="ms-auto d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100">
              <div className="nav-pills-wrap ms-lg-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `nav-pill ${isActive ? "nav-pill-active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light"
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
