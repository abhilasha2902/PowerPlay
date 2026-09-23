import './ReserveWidget.css'

interface ReserveWidgetProps {
  pricePerNight: number
  nights: number
  rating: number
  reviewCount: number
}

export default function ReserveWidget({ pricePerNight, nights, rating, reviewCount }: ReserveWidgetProps) {
  const total = pricePerNight * nights

  return (
    <aside className="reserve-widget" aria-label="Reservation">
      <div className="reserve-widget-price-row">
        <span className="reserve-widget-price">₹{pricePerNight.toLocaleString('en-IN')}</span>
        <span className="reserve-widget-price-unit">night</span>
      </div>
      <div className="reserve-widget-fields">
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Check-in</span>
          <span className="reserve-widget-field-value">Add date</span>
        </div>
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Check-out</span>
          <span className="reserve-widget-field-value">Add date</span>
        </div>
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Guests</span>
          <span className="reserve-widget-field-value">1 guest</span>
        </div>
      </div>
      <button type="button" className="reserve-button">Reserve</button>
      <div className="reserve-widget-subtotal">
        <span>₹{pricePerNight.toLocaleString('en-IN')} x {nights} nights</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>
      <div className="reserve-widget-rating">
        <svg viewBox="0 0 32 32" width="14" height="14" aria-hidden="true">
          <path d="M15.1 1.58l-4.13 8.88-9.57 1.2a1 1 0 00-.57 1.74l7.15 6.7-1.9 9.9a1 1 0 001.47 1.06L16 25.85l8.45 4.21a1 1 0 001.47-1.06l-1.9-9.9 7.15-6.7a1 1 0 00-.57-1.74l-9.57-1.2L16.9 1.58a1 1 0 00-1.8 0z" fill="currentColor" />
        </svg>
        <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
      </div>
    </aside>
  )
}
