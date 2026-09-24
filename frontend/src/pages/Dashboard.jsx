import { useEffect, useState } from "react";
import { api } from "../api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error)
    return (
      <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md">
        {error}
      </div>
    );
  if (!data) return <div>Завантаження...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Дашборд</h1>

      <div className="flex gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg flex-1 shadow">
          <span className="text-slate-500 text-sm">Всього товарів</span>
          <div className="text-2xl font-bold">{data.totalProducts}</div>
        </div>

        <div className="bg-white p-5 rounded-lg flex-1 shadow">
          <span className="text-slate-500 text-sm">Вартість складу</span>
          <div className="text-2xl font-bold">
            {data.totalStockValue.toLocaleString()} грн
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg flex-1 shadow">
          <span className="text-slate-500 text-sm">
            Товари з низьким залишком
          </span>
          <div className="text-2xl font-bold">
            {data.lowStockProducts.length}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-base font-semibold mb-2">
          Товари з низьким залишком
        </h2>
        <table className="w-full bg-white rounded-lg overflow-hidden shadow">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-3 py-2">Назва</th>
              <th className="px-3 py-2">Категорія</th>
              <th className="px-3 py-2">Залишок</th>
              <th className="px-3 py-2">Мін. залишок</th>
            </tr>
          </thead>
          <tbody>
            {data.lowStockProducts.map((p) => (
              <tr key={p._id} className="border-t border-slate-200">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.category?.name}</td>
                <td className="px-3 py-2">{p.quantity}</td>
                <td className="px-3 py-2">{p.minQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2">Останні рухи</h2>
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
            {data.recentMovements.map((m) => (
              <tr key={m._id} className="border-t border-slate-200">
                <td className="px-3 py-2">{m.product?.name}</td>
                <td className="px-3 py-2">{m.type}</td>
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
    </div>
  );
}

export default Dashboard;
