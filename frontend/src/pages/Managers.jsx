import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Managers() {
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const emptyForm = { name: "", email: "", password: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    loadManagers();
  }, []);

  function loadManagers() {
    api
      .get("/auth/managers")
      .then(setManagers)
      .catch((err) => setError(err.message));
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/managers", form);
      setForm(emptyForm);
      setShowForm(false);
      loadManagers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Видалити менеджера?")) return;

    try {
      await api.delete(`/auth/managers/${id}`);
      loadManagers();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "border border-slate-300 rounded-md px-3 py-2 flex-1 min-w-40";

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">Менеджери</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
        >
          + Додати менеджера
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg mb-5 flex flex-wrap gap-2.5 shadow"
        >
          <input
            type="text"
            placeholder="Ім'я"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className={inputClass}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            className={inputClass}
          />

          <input
            type="password"
            placeholder="Тимчасовий пароль"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
            minLength={6}
            className={inputClass}
          />

          <div className="w-full flex gap-2.5">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2"
            >
              Створити
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-200 hover:bg-slate-300 rounded-md px-4 py-2"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      <table className="w-full bg-white rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="px-3 py-2">Ім'я</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {managers.map((m) => (
            <tr key={m.id} className="border-t border-slate-200">
              <td className="px-3 py-2">{m.name}</td>
              <td className="px-3 py-2">{m.email}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-600 hover:underline"
                >
                  Вид.
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Managers;
