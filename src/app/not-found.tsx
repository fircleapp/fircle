import Link from "next/link";

const mainStyle: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  margin: 0,
  backgroundColor: "#0b0b0b",
  color: "#f5f5f5",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  border: "1px solid #2a2a2a",
  borderRadius: "20px",
  backgroundColor: "#141414",
  boxSizing: "border-box",
  padding: "24px",
  textAlign: "center",
};

const statusStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#b0b0b0",
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const headingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "30px",
  lineHeight: 1.2,
  fontWeight: 700,
  color: "#ffffff",
};

const bodyTextStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#d0d0d0",
};

const buttonRowStyle: React.CSSProperties = {
  marginTop: "20px",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "center",
};

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid #3a3a3a",
  borderRadius: "9999px",
  backgroundColor: "transparent",
  color: "#f5f5f5",
  fontSize: "14px",
  fontWeight: 600,
  padding: "10px 16px",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function NotFound() {
  return (
    <main style={mainStyle}>
      <section style={cardStyle} aria-live="polite">
        <p style={statusStyle}>404 ERROR</p>
        <h1 style={headingStyle}>Page not found</h1>
        <p style={bodyTextStyle}>We could not find the page you were looking for.</p>
        <p style={bodyTextStyle}>Head back home and continue from there.</p>

        <div style={buttonRowStyle}>
          <Link href="/" style={buttonStyle}>
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
