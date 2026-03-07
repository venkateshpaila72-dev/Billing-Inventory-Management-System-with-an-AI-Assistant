const CategoryFilter = ({ categories, selected, onChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
          selected === "all"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
        }`}
      >
        All
      </button>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            selected === c.id
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;