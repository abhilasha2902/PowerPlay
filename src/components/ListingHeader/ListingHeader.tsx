import { useState } from 'react'
import './ListingHeader.css'

interface ListingHeaderProps {
  title: string
}

export default function ListingHeader({ title }: ListingHeaderProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="listing-header">
      <h1 className="listing-header-title">{title}</h1>
      <div className="listing-header-actions">
        <button type="button" className="action-button">
          <span className="action-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="action-button-label">Share</span>
        </button>
        <button
          type="button"
          className="action-button"
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
        >
          <span className={`action-button-icon${saved ? ' saved' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5 3.5 3.5 7C19.5 15.65 12 20 12 20z"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="action-button-label">Save</span>
        </button>
      </div>
    </div>
  )
}
