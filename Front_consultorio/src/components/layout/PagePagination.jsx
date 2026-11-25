const PagePagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  label = "Pagina",
}) => {
  return (
    <section className="page-pagination mt-3 mt-md-4">
      <div className="page-pagination-meta">
        <span className="soft-badge">{label}</span>
        <p className="page-pagination-summary">
          {page} / {totalPages}
        </p>
      </div>

      <div className="page-pagination-actions">
        <button
          className="page-nav-btn btn btn-outline-secondary"
          disabled={disablePrev}
          onClick={onPrev}
        >
          Anterior
        </button>
        <button
          className="page-nav-btn page-nav-btn-primary btn btn-primary"
          disabled={disableNext}
          onClick={onNext}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
};

export default PagePagination;
