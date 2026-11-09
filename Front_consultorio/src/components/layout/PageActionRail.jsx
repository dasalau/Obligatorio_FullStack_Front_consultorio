const PageActionRail = ({
  placeholder,
  addLabel,
  onAdd,
  showAddButton = true,
  value = "",
  onSearchChange,
}) => {
  return (
    <div className="page-action-rail">
      <div className="search-box" aria-label={placeholder}>
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={value ?? ""}
          onChange={onSearchChange}
          readOnly={!onSearchChange}
        />
      </div>

      {showAddButton && (
        <button className="nav-action-btn" onClick={onAdd} type="button">
          {addLabel}
        </button>
      )}
    </div>
  );
};

export default PageActionRail;
