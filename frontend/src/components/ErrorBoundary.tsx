import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "var(--font)", color: "var(--text)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h2>
          <pre style={{
            fontSize: 12, color: "var(--red)", background: "var(--red-light)",
            padding: 12, borderRadius: 6, overflow: "auto",
          }}>
            {this.state.error.message}
          </pre>
          <button
            style={{ marginTop: 12, fontSize: 13, padding: "6px 12px", cursor: "pointer" }}
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
