import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <span className="navbar-logo" aria-label="Airbnb clone home">airbnb</span>
      <button type="button" className="navbar-search">
        <span>Anywhere</span>
        <span aria-hidden="true">·</span>
        <span>Any week</span>
        <span aria-hidden="true">·</span>
        <span>Add guests</span>
      </button>
      <div className="navbar-right">
        <button type="button" className="navbar-icon-button" aria-label="Change language and region">
          🌐
        </button>
        <button type="button" className="navbar-icon-button" aria-label="Open main menu">
          ☰
        </button>
      </div>
    </header>
  )
}
