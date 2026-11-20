import React from "react";

// Safety net around the page area (header and footer stay usable).
// If a page's code file cannot be downloaded (flaky network, or a new version was just deployed),
// the page is reloaded once automatically; otherwise a small "Reload page" message is shown
// instead of the whole website going blank.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|ChunkLoadError/i;
const RELOAD_KEY = "life_science_chunk_reload_at";

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    try {
      if (!CHUNK_ERROR.test(String((error && error.message) || error))) return;
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last > 30000) {
        // at most one automatic reload every 30s, so it can never loop
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
      }
    } catch {
      // ignore - the fallback message below is still shown
    }
  }

  componentDidUpdate(prevProps) {
    // Navigating to another page clears the error
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: 24,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>This page could not be loaded. Please check your internet connection.</p>
          <button type="button" className="add-btn" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
