interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : ''}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p className="mt-4 text-base text-slate-600">{description}</p>}
    </div>
  );
}
