import useWindowWidth from "../hooks/useWindowWidth";

const adminEntryButtonStyle = {
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,232,241,0.72)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "9px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
  minHeight: "36px",
  alignSelf: "center",
};

export default function Navbar({
  currentPage,
  setCurrentPage,
  adminMode,
  onOpenAdminModal,
}) {
  const links = ["Home", "Our Story", "Gallery", "For Her", "For Me"];
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        background:
          "linear-gradient(180deg, rgba(82, 7, 42, 0.40) 0%, rgba(48, 0, 24, 0.26) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 10px 30px rgba(60, 0, 28, 0.10)",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
          padding: isMobile ? "14px 16px" : "18px 20px",
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setCurrentPage("Home")}
          style={{
            border: "none",
            background: "transparent",
            padding: "10px 12px",
            margin: "-10px 0 -10px -12px",
            cursor: "pointer",
            color: "#ffe4ef",
            fontWeight: 900,
            letterSpacing: isMobile ? "0.18em" : "0.28em",
            fontSize: isMobile ? "22px" : "28px",
            lineHeight: 1,
            textShadow: "0 2px 12px rgba(255, 120, 180, 0.12)",
            minHeight: "44px",
            minWidth: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          PINK
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            minWidth: 0,
            justifyContent: isMobile ? "flex-start" : "flex-end",
            flexWrap: "wrap",
            rowGap: "10px",
          }}
        >
          <div
            className="nav-scroll-row"
            style={{
              display: "flex",
              gap: "10px",
              overflowX: isMobile ? "auto" : "visible",
              flexWrap: isMobile ? "nowrap" : "wrap",
              flex: "1 1 auto",
              minWidth: 0,
              justifyContent: isMobile ? "flex-start" : "flex-end",
              paddingBottom: isMobile ? "2px" : 0,
            }}
          >
            {links.map((link) => {
              const active = currentPage === link;

              return (
                <button
                  type="button"
                  key={link}
                  onClick={() => setCurrentPage(link)}
                  style={{
                    border: active
                      ? "1px solid rgba(255,255,255,0.18)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: active
                      ? "linear-gradient(180deg, #ff5ea2 0%, #ff2e86 100%)"
                      : "rgba(255,255,255,0.06)",
                    color: "#fff5fa",
                    padding: isMobile ? "10px 14px" : "10px 16px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 10px 24px rgba(255,46,134,0.28)"
                      : "none",
                    transition: "all 0.25s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {link}
                </button>
              );
            })}
          </div>

          {!adminMode ? (
            <button
              type="button"
              aria-label="Open admin sign-in"
              onClick={onOpenAdminModal}
              style={adminEntryButtonStyle}
            >
              Admin
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
