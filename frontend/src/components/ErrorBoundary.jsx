import React from "react";

const isDev = import.meta.env.DEV;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            margin: 0,
            padding:
              "max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 28%), linear-gradient(180deg, #ffd6e7 0%, #ffc1da 45%, #ffb0d1 100%)",
            fontFamily: "Arial, Helvetica, sans-serif",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "min(520px, 100%)",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.30)",
              background: "rgba(255,255,255,0.14)",
              boxShadow: "0 24px 60px rgba(120, 20, 70, 0.14)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "28px 22px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#9a2e61",
              }}
            >
              PINK
            </p>

            <h1
              style={{
                margin: "14px 0 0",
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#7a003c",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                margin: "14px 0 0",
                fontSize: "15px",
                lineHeight: 1.65,
                color: "#5c2140",
              }}
            >
              A small glitch interrupted this page. You can try loading again
              — your memories and music are still safe on the server.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              style={{
                marginTop: "22px",
                border: "none",
                borderRadius: "18px",
                padding: "14px 22px",
                background: "linear-gradient(180deg, #ff5ea2, #ff2e86)",
                color: "white",
                fontWeight: 800,
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(255,46,134,0.35)",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                minHeight: "44px",
              }}
            >
              Reload page
            </button>

            {isDev ? (
              <>
                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: "28px",
                    marginBottom: "10px",
                    color: "#9a2e61",
                  }}
                >
                  Dev details
                </h2>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textAlign: "left",
                    background: "rgba(255,255,255,0.45)",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.35)",
                    fontSize: "12px",
                    color: "#5c2140",
                    maxHeight: "min(200px, 40vh)",
                    overflow: "auto",
                  }}
                >
                  {this.state.error?.toString() || "Unknown error"}
                </pre>

                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textAlign: "left",
                    marginTop: "12px",
                    background: "rgba(255,255,255,0.45)",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.35)",
                    fontSize: "11px",
                    color: "#5c2140",
                    maxHeight: "min(240px, 45vh)",
                    overflow: "auto",
                  }}
                >
                  {this.state.errorInfo?.componentStack || "No component stack"}
                </pre>
              </>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
