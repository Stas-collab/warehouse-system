import { useEffect, useState } from "react";
import { api } from "../api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  const [form, setForm] = useState(emptyForm);

  function loadSuppliers() {
    api
      .get("/suppliers")
      .then(setSuppliers)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(supplier) {
    setForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
    setEditingId(supplier._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post("/suppliers", form);
      }
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Видалити постачальника?")) return;

    try {
      await api.delete(`/suppliers/${id}`);
      loadSuppliers();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputClass =
    "border border-slate-300 rounded-md px-3 py-2 flex-1 min-w-40";

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">Постачальники</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
        >
          + Додати постачальника
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
            placeholder="Назва"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={inputClass}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Адреса"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={inputClass}
          />

          <div className="w-full flex gap-2.5">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2"
            >
              Зберегти
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
            <th className="px-3 py-2">Назва</th>
            <th className="px-3 py-2">Телефон</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Адреса</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s._id} className="border-t border-slate-200">
              <td className="px-3 py-2">{s.name}</td>
              <td className="px-3 py-2">{s.phone}</td>
              <td className="px-3 py-2">{s.email}</td>
              <td className="px-3 py-2">{s.address}</td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => openEditForm(s)}
                  className="text-blue-600 hover:underline"
                >
                  Ред.
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
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

export default Suppliers;
