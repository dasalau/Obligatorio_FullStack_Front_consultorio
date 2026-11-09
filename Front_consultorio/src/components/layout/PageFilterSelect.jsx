const PageFilterSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Todos",
  width = 320,
}) => {
  return (
    <section className="card section-card border-0">
      <label className="form-label mb-0" style={{ maxWidth: width }}>
        {label}
        <select className="form-select" value={value} onChange={onChange}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
};

export default PageFilterSelect;
