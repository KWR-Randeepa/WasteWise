function Footer() {
  return (
    <footer style={footerStyle}>
      <p>📞 Hotline: 011-1234567</p>
      <p>📍 Urban Council Office, Sri Lanka</p>
      <p>© 2026 Urban Council Management System</p>
    </footer>
  );
}

const footerStyle = {
  background: "#111827",
  color: "white",
  textAlign: "center",
  padding: "20px",
  marginTop: "20px"
};

export default Footer;