import { ImageResponse } from 'next/og'

// Next.js App Router favicon — drop this file into /app/ and the icon
// is served automatically at /favicon.ico (Next.js handles the route).
// No <link rel="icon"> needed in layout.tsx.

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width={22}
          height={22}
          fill="none"
        >
          <path
            d="M5 20 L14 20 L17 10 L20 28 L23 20 L35 20"
            stroke="#10B981"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
