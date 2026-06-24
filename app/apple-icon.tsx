import { ImageResponse } from 'next/og'

// Apple touch icon — drop into /app/ alongside icon.tsx.
// Served automatically at /apple-icon.png.

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B1220',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width={120}
          height={120}
          fill="none"
        >
          <path
            d="M5 20 L14 20 L17 10 L20 28 L23 20 L35 20"
            stroke="#10B981"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
