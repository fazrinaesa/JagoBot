import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Penjaga agar kesalahan render tidak berakhir sebagai halaman putih kosong.
 * Tidak mengubah alur aplikasi: saat normal, children dirender apa adanya.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Kesalahan render aplikasi:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: "20px" }}>Halaman gagal dimuat</h1>
          <p style={{ margin: "0 0 16px", color: "#475569", lineHeight: 1.6 }}>
            Terjadi kesalahan saat menampilkan halaman ini. Muat ulang untuk
            melanjutkan; data Anda tidak terpengaruh.
          </p>
          <pre
            style={{
              margin: "0 0 20px",
              padding: "12px",
              background: "#f1f5f9",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#334155",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              background: "#1800ad",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }
}
