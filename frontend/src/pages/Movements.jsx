import { useEffect, useState } from "react";
import { api } from "../api";

function Movements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    product: "",
    type: "incoming",
    quantity: 0,
    fromLocation: "",
    toLocation: "",
    reason: "",
    comment: "",
  };

  const [form, setForm] = useState(emptyForm);

  function loadMovements() {
    api
      .get("/movements")
      .then((data) => setMovements(data.movements))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadMovements();
    api
      .get("/products")
      .then(setProducts)
      .catch(() => {});
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = { ...form };
      if (!payload.fromLocation) delete payload.fromLocation;
      if (!payload.toLocation) delete payload.toLocation;

      await api.post("/movements", payload);
      setShowForm(false);
      loadMovements();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const typeLabels = {
    incoming: "Прихід",
    outgoing: "Витрата",
    transfer: "Переміщення",
    adjustment: "Коригування",
  };

  const inputClass =
    "border border-slate-300 rounded-md px-3 py-2 flex-1 min-w-40";

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">Рухи товарів</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
        >
          + Новий рух
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
          <select
            value={form.product}
            onChange={(e) => handleChange("product", e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Товар</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className={inputClass}
          >
            <option value="incoming">Прихід</option>
            <option value="outgoing">Витрата</option>
            <option value="transfer">Переміщення</option>
            <option value="adjustment">Коригування</option>
          </select>

          <input
            type="number"
            placeholder="Кількість"
            value={form.quantity}
            onChange={(e) => handleChange("quantity", Number(e.target.value))}
            required
            className={inputClass}
          />

          {form.type === "transfer" && (
            <input
              type="text"
              placeholder="ID нового місця зберігання"
              value={form.toLocation}
              onChange={(e) => handleChange("toLocation", e.target.value)}
              required
              className={inputClass}
            />
          )}

          <input
            type="text"
            placeholder="Причина"
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Коментар"
            value={form.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
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
            <th className="px-3 py-2">Товар</th>
            <th className="px-3 py-2">Тип</th>
            <th className="px-3 py-2">К-сть</th>
            <th className="px-3 py-2">Користувач</th>
            <th className="px-3 py-2">Дата</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m._id} className="border-t border-slate-200">
              <td className="px-3 py-2">{m.product?.name}</td>
              <td className="px-3 py-2">{typeLabels[m.type]}</td>
              <td className="px-3 py-2">{m.quantity}</td>
              <td className="px-3 py-2">{m.user?.name}</td>
              <td className="px-3 py-2">
                {new Date(m.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Movements;
