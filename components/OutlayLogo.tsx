import { PulseMark } from './PulseMark'

interface OutlayLogoProps {
  /**
   * Icon square height in px. Wordmark font size scales proportionally.
   * Default: 36
   */
  size?: number
  /**
   * 'onLight' — placed on white / paper background (icon box is navy #0B1220)
   * 'onDark'  — placed on navy background (icon box is a subtle transparent layer)
   * Default: 'onLight'
   */
  variant?: 'onLight' | 'onDark'
  /** Render the "outlay" wordmark next to the icon. Default: true */
  showWordmark?: boolean
  className?: string
}

/**
 * Full Outlay logo: navy rounded-square icon + lowercase wordmark.
 * Font inherits Geist Sans from the layout — no explicit font-family needed.
 *
 * @example
 * // Nav bar on a white page
 * <OutlayLogo size={36} variant="onLight" />
 *
 * // Footer on a navy page, icon only
 * <OutlayLogo size={32} variant="onDark" showWordmark={false} />
 */
export function OutlayLogo({
  size = 36,
  variant = 'onLight',
  showWordmark = true,
  className = '',
}: OutlayLogoProps) {
  const iconBg    = variant === 'onLight' ? '#0B1220' : 'rgba(255, 255, 255, 0.10)'
  const textColor = variant === 'onLight' ? '#0B1220' : '#FAFAF9'

  const iconSize     = Math.round(size * 0.58)
  const borderRadius = Math.round(size * 0.25)
  const fontSize     = Math.round(size * 0.56)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon container */}
      <div
        style={{
          width: size,
          height: size,
          background: iconBg,
          borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PulseMark size={iconSize} />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          style={{
            fontSize,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: textColor,
            lineHeight: 1,
          }}
        >
          outlay
        </span>
      )}
    </div>
  )
}
