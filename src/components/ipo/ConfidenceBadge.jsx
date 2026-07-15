import { confidenceColor, confidenceDot } from '@/lib/ipoUtils';

export default function ConfidenceBadge({ confidence, showLabel = true }) {
  const color = confidenceColor(confidence);
  const dot = confidenceDot(confidence);
  const label = confidence || 'unverified';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {showLabel ? label.charAt(0).toUpperCase() + label.slice(1) : null}
    </span>
  );
}
