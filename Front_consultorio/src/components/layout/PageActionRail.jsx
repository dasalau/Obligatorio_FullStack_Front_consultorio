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
      <div className="search-box input-group" aria-label={placeholder}>
        <span className="search-icon input-group-text" aria-hidden="true">
          <svg
            className="search-icon-svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.65 16.65M10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5C18 14.6421 14.6421 18 10.5 18Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          className="form-control"
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={value ?? ""}
          onChange={onSearchChange}
          readOnly={!onSearchChange}
        />
      </div>

      {showAddButton && (
        <button
          className="nav-action-btn btn btn-primary"
          onClick={onAdd}
          type="button"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
};

export default PageActionRail;
