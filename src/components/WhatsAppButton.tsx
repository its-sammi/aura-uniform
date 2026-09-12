interface WhatsAppButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export default function WhatsAppButton({ url, label = 'WhatsApp', className = '' }: WhatsAppButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`whatsapp-button shine-effect ${className}`.trim()}
    >
      <span aria-hidden="true" className="inline-flex items-center justify-center">
        <img src="/whatsapp.svg" alt="" className="whatsapp-mark" />
      </span>
      <span className="whatsapp-label">{label}</span>
    </a>
  );
}
