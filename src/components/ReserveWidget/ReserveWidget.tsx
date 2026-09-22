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
        <span className="reserve-widget-price">${pricePerNight}</span>
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
        <span>${pricePerNight} x {nights} nights</span>
        <span>${total}</span>
      </div>
      <div className="reserve-widget-subtotal">
        <span aria-hidden="true">★</span>
        <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
      </div>
    </aside>
  )
}
