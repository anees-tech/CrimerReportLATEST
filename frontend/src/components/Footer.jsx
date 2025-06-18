import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Crime Reporting System</h3>
            <p className="footer-description">
              A platform dedicated to making crime reporting faster, safer, and more transparent.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/report-crime">Report Crime</a>
              </li>
              <li>
                <a href="/dashboard">My Reports</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <p>Emergency: 911</p>
            <p>Non-Emergency: 311</p>
            <p>Email: support@crimereport.org</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Crime Reporting System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

