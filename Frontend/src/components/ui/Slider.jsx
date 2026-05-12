'use client';

import clsx from 'clsx';

// Single-value range slider. Brand-tinted track + circular thumb.
// Wraps the native <input type=range> for full accessibility (keyboard,
// screen reader, drag).
//
// Usage:
//   <Slider value={budget} min={0} max={500000} step={1000}
//           onChange={setBudget} formatValue={(v) => `₹${v.toLocaleString('en-IN')}`} />

export default function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue,
  label,
  showValue = true,
  disabled = false,
  className,
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {label && <span className="text-sm font-medium text-zinc-700">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-brand-700">
              {formatValue ? formatValue(value) : value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-6">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-200" />
        {/* Filled portion */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-600"
          style={{ width: `${percent}%` }}
        />
        {/* Native input — invisible but full-width over the track */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="ch-slider absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={label}
        />
      </div>
      <style jsx>{`
        .ch-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #0a2472;
          box-shadow: 0 1px 3px rgba(5, 22, 80, 0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .ch-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .ch-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(10, 36, 114, 0.25);
        }
        .ch-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #0a2472;
          box-shadow: 0 1px 3px rgba(5, 22, 80, 0.25);
          cursor: pointer;
        }
        .ch-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
