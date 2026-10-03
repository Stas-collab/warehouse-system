import { useEffect, useState } from "react";
import { api } from "../api";
import { useSort } from "../hooks/useSort";
import SortableHeader from "../components/SortableHeader";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const {
    sorted: sortedCategories,
    sortKey,
    sortDir,
    toggleSort,
  } = useSort(categories, "name");

  const emptyForm = {
    name: "",
    description: "",
  };

  const [form, setForm] = useState(emptyForm);

  function loadCategories() {
    api
      .get("/categories")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(category) {
    setForm({
      name: category.name,
      description: category.description,
    });
    setEditingId(category._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Видалити категорію?")) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
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
        <h1 className="text-2xl font-semibold">Категорії</h1>
        {isAdmin && (
          <button
            onClick={openCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
          >
            + Додати категорію
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {showForm && isAdmin && (
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
            placeholder="Опис"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
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
            <SortableHeader
              label="Назва"
              sortKeyName="name"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Опис"
              sortKeyName="description"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            {isAdmin && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map((c) => (
            <tr key={c._id} className="border-t border-slate-200">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.description}</td>
              {isAdmin && (
                <td className="px-3 py-2 flex gap-2">
                  <button
                    onClick={() => openEditForm(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Ред.
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-600 hover:underline"
                  >
                    Вид.
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Categories;
