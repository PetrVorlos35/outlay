import { SVGProps } from 'react'

interface PulseMarkProps extends SVGProps<SVGSVGElement> {
  /** Icon size in px (width = height). Default: 40 */
  size?: number
  /** Stroke color. Default: brand emerald */
  color?: string
}

/**
 * Outlay pulse mark — the raw SVG with no background container.
 * Use inside a colored div or pass directly wherever an SVG is expected.
 *
 * @example
 * // Standalone
 * <PulseMark size={24} />
 *
 * // Custom color (e.g. on a colored background where emerald doesn't contrast)
 * <PulseMark size={24} color="#FAFAF9" />
 */
export function PulseMark({
  size = 40,
  color = '#10B981',
  ...props
}: PulseMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 20 L14 20 L17 10 L20 28 L23 20 L35 20"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
