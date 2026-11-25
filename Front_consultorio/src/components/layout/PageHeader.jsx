const PageHeader = ({ title, subtitle, rightContent }) => {
  return (
    <section className="page-header card border-0 mb-3 mb-md-4">
      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
        <div>
          <h1 className="page-title mb-1">{title}</h1>
          {subtitle && <p className="page-subtitle mb-0">{subtitle}</p>}
        </div>
        {rightContent && <div className="page-header-right">{rightContent}</div>}
      </div>
    </section>
  );
};

export default PageHeader;
