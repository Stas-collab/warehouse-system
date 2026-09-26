import { NavLink, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-800 text-white flex flex-col p-5">
        <h2 className="text-xl mb-6">Warehouse</h2>

        <nav className="flex flex-col gap-2 flex-1">
          <NavLink to="/dashboard" className={linkClass}>
            Дашборд
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Товари
          </NavLink>
          <NavLink to="/movements" className={linkClass}>
            Рухи
          </NavLink>
          <NavLink to="/suppliers" className={linkClass}>
            Постачальники
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            Категорії
          </NavLink>
          <NavLink to="/locations" className={linkClass}>
            Локації
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/managers" className={linkClass}>
              Менеджери
            </NavLink>
          )}
        </nav>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-600">
          {user && (
            <span className="text-sm text-slate-300">
              {user.name} {user.role === "admin" ? "(адмін)" : ""}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-slate-600 hover:bg-slate-500 rounded-md py-2 text-sm"
          >
            Вийти
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-slate-100">{children}</main>
    </div>
  );
}

export default Layout;
