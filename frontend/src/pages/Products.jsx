import { useEffect, useState } from "react";
import { api } from "../api";
import { useSort } from "../hooks/useSort";
import SortableHeader from "../components/SortableHeader";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const {
    sorted: sortedProducts,
    sortKey,
    sortDir,
    toggleSort,
  } = useSort(products, "name");

  const emptyForm = {
    name: "",
    sku: "",
    category: "",
    supplier: "",
    location: "",
    unit: "шт",
    quantity: 0,
    minQuantity: 0,
    price: 0,
  };

  const [form, setForm] = useState(emptyForm);

  function loadProducts() {
    api
      .get("/products")
      .then(setProducts)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadProducts();
    api
      .get("/categories")
      .then(setCategories)
      .catch(() => {});
    api
      .get("/suppliers")
      .then(setSuppliers)
      .catch(() => {});
    api
      .get("/locations")
      .then(setLocations)
      .catch(() => {});
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(product) {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category?._id || "",
      supplier: product.supplier?._id || "",
      location: product.location?._id || "",
      unit: product.unit,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      price: product.price,
    });
    setEditingId(product._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = { ...form };
      if (!payload.supplier) delete payload.supplier;
      if (!payload.location) delete payload.location;

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Видалити товар?")) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
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
        <h1 className="text-2xl font-semibold">Товари</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
        >
          + Додати товар
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
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            required
            className={inputClass}
          />

          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Категорія</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.supplier}
            onChange={(e) => handleChange("supplier", e.target.value)}
            className={inputClass}
          >
            <option value="">Постачальник</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className={inputClass}
          >
            <option value="">Локація</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className={inputClass}
          >
            <option value="шт">шт</option>
            <option value="кг">кг</option>
            <option value="л">л</option>
            <option value="м">м</option>
            <option value="уп">уп</option>
          </select>

          <input
            type="number"
            placeholder="Кількість"
            value={form.quantity}
            onChange={(e) => handleChange("quantity", Number(e.target.value))}
            required
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Мін. кількість"
            value={form.minQuantity}
            onChange={(e) =>
              handleChange("minQuantity", Number(e.target.value))
            }
            required
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Ціна"
            value={form.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            required
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
              label="SKU"
              sortKeyName="sku"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Категорія"
              sortKeyName="category.name"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Локація"
              sortKeyName="location.name"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Кількість"
              sortKeyName="quantity"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Ціна"
              sortKeyName="price"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((p) => (
            <tr key={p._id} className="border-t border-slate-200">
              <td className="px-3 py-2">{p.name}</td>
              <td className="px-3 py-2">{p.sku}</td>
              <td className="px-3 py-2">{p.category?.name}</td>
              <td className="px-3 py-2">{p.location?.name || "—"}</td>
              <td className="px-3 py-2">{p.quantity}</td>
              <td className="px-3 py-2">{p.price} грн</td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => openEditForm(p)}
                  className="text-blue-600 hover:underline"
                >
                  Ред.
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-600 hover:underline"
                  >
                    Вид.
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;
