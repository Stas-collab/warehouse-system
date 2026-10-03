function SortableHeader({ label, sortKeyName, sortKey, sortDir, onSort }) {
  const isActive = sortKey === sortKeyName;
  const arrow = isActive ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <th
      onClick={() => onSort(sortKeyName)}
      className="px-3 py-2 cursor-pointer select-none hover:text-blue-600"
    >
      {label}
      {arrow}
    </th>
  );
}

export default SortableHeader;
