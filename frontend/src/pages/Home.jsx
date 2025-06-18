import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {


  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Report Crimes Easily and Securely</h1>
          <p className="hero-description">
            Our Crime Reporting System allows you to report crimes, upload
            evidence, and track your case progress. We support anonymous
            reporting to ensure your safety and privacy.
          </p>
          <div className="hero-buttons">
            <Link to="/report-crime" className="btn btn-primary">
              Report a Crime
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>
      <Link to="/NewRouteComponent">Go to New Route</Link>
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Easy Reporting</h3>
            <p className="feature-description">
              Submit crime reports with descriptions, locations, and optional
              evidence uploads.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Anonymous Reporting</h3>
            <p className="feature-description">
              Option for whistleblowers and victims to report crimes
              confidentially.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">Real-Time Notifications</h3>
            <p className="feature-description">
              Receive alerts when law enforcement responds to your report.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Case Tracking</h3>
            <p className="feature-description">
              Track the status of your reports in real-time as they progress.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3 className="step-title">Create an Account</h3>
            <p className="step-description">
              Sign up for an account or choose to report anonymously.
            </p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3 className="step-title">Submit a Report</h3>
            <p className="step-description">
              Provide details about the incident, location, and any evidence.
            </p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3 className="step-title">Track Progress</h3>
            <p className="step-description">
              Follow the status of your report as authorities investigate.
            </p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3 className="step-title">Receive Updates</h3>
            <p className="step-description">
              Get notifications about actions taken on your report.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
