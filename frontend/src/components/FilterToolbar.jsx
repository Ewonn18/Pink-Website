export default function FilterToolbar({
  summaryText = "",
  helperText = "",
  searchInput = "",
  onSearchInputChange,
  searchPlaceholder = "Search...",
  secondaryControl = null,
  onSubmit,
  onReset,
  activeFilters = [],
  windowWidth = 1400,
  inputStyle,
  buttonStyle,
  ghostButtonStyle,
  activeFilterPillStyle,
}) {
  const formGridTemplateColumns =
    windowWidth >= 900 ? "minmax(0, 1fr) 180px auto auto" : "1fr";

  return (
    <div
      style={{
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(48,0,24,0.55), rgba(20,0,12,0.65))",
        padding: "18px 20px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        marginBottom: "18px",
      }}
    >
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#ffe8f1",
              fontSize: "14px",
            }}
          >
            {summaryText}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#ffd8e7",
              fontWeight: 600,
            }}
          >
            {helperText}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: formGridTemplateColumns,
          }}
        >
          <input
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder={searchPlaceholder}
            style={inputStyle}
          />

          {secondaryControl}

          <button type="submit" style={buttonStyle}>
            Search
          </button>

          <button type="button" onClick={onReset} style={ghostButtonStyle}>
            Reset
          </button>
        </form>

        {Array.isArray(activeFilters) && activeFilters.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {activeFilters.map((filter, index) => (
              <span key={`${filter}-${index}`} style={activeFilterPillStyle}>
                {filter}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
