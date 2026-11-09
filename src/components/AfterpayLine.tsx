import {
  AFTERPAY_DISCLAIMER,
  AFTERPAY_TERMS_URL,
  afterpayEligible,
  installmentLabel,
} from '@/lib/afterpay';

/** "or 4 payments of $27 with Afterpay", plus the required disclaimer. */
export default function AfterpayLine({ cents }: { cents: number }) {
  if (!afterpayEligible(cents)) return null;
  return (
    <div className="afterpay-line">
      <p className="afterpay-main">
        or 4 payments of <strong>{installmentLabel(cents)}</strong> with <strong>Afterpay</strong>
      </p>
      <p className="afterpay-fine">
        {AFTERPAY_DISCLAIMER}{' '}
        <a href={AFTERPAY_TERMS_URL} target="_blank" rel="noopener noreferrer">
          terms
        </a>
      </p>
    </div>
  );
}
