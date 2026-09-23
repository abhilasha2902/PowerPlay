import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button type="button" className="navbar-logo" aria-label="Airbnb clone home">
          <svg className="navbar-logo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c-2.5 3.5-6 8-6 12a6 6 0 0012 0c0-4-3.5-8.5-6-12zm0 15a3.5 3.5 0 01-3.5-3.5c0-.6.2-1.3.6-2.1.5.9 1.4 1.6 2.4 1.9-.1-1-.1-2.2.5-3.3.6 1.1.6 2.3.5 3.3 1-.3 1.9-1 2.4-1.9.4.8.6 1.5.6 2.1A3.5 3.5 0 0112 17z" />
          </svg>
          <span className="navbar-logo-text">airbnb</span>
        </button>

        <div className="navbar-search" role="search">
          <button type="button" className="navbar-search-segment">
            <svg className="navbar-search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 10v8.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 19.5V14h4v5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Anywhere
          </button>
          <span className="navbar-search-divider" aria-hidden="true" />
          <button type="button" className="navbar-search-segment">Anytime</button>
          <span className="navbar-search-divider" aria-hidden="true" />
          <button type="button" className="navbar-search-segment guests">Add guests</button>
          <button type="button" className="navbar-search-submit" aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="navbar-right">
          <button type="button" className="navbar-host-link">Become a host</button>
          <button type="button" className="navbar-icon-button" aria-label="Change language and region">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" className="navbar-icon-button" aria-label="Open main menu">
            <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
              <line x1="4" y1="9" x2="28" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="23" x2="28" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
