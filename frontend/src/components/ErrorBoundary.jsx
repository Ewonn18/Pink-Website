import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "24px",
            background: "#fff0f6",
            color: "#7a1f4a",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              background: "white",
              border: "1px solid #ffc2db",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(214,51,132,0.12)"
            }}
          >
            <h1 style={{ marginTop: 0, color: "#c2185b" }}>
              Your app crashed
            </h1>

            <p>
              This is why the browser looked blank. Check the error below and
              send me a screenshot if you want me to fix the exact line.
            </p>

            <h2 style={{ fontSize: "18px", marginTop: "24px" }}>Error</h2>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#fff6fa",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #ffd6e7"
              }}
            >
              {this.state.error?.toString() || "Unknown error"}
            </pre>

            <h2 style={{ fontSize: "18px", marginTop: "24px" }}>
              Component stack
            </h2>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#fff6fa",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #ffd6e7"
              }}
            >
              {this.state.errorInfo?.componentStack || "No component stack"}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}