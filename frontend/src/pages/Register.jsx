import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", form);
      const data = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl w-80 flex flex-col gap-3 shadow"
      >
        <h1 className="text-center text-xl mb-2">Реєстрація</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Ім'я"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          className="border border-slate-300 rounded-md px-3 py-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          className="border border-slate-300 rounded-md px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          required
          minLength={6}
          className="border border-slate-300 rounded-md px-3 py-2"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2"
        >
          Зареєструватись
        </button>

        <Link
          to="/login"
          className="text-center text-sm text-slate-500 hover:underline"
        >
          Вже є акаунт? Увійти
        </Link>
      </form>
    </div>
  );
}

export default Register;
