import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <span className="navbar-logo">airbnb</span>
      <button type="button" className="navbar-search">
        <span>Anywhere</span>
        <span aria-hidden="true">·</span>
        <span>Any week</span>
        <span aria-hidden="true">·</span>
        <span>Add guests</span>
      </button>
      <div className="navbar-right">
        <button type="button" className="navbar-icon-button" aria-label="Change language and region">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button type="button" className="navbar-icon-button" aria-label="Open main menu">
          ☰
        </button>
      </div>
    </header>
  )
}
