interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', style, hover = false, onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl shadow-[0_2px_16px_rgba(215,119,6,0.08)] border border-[#E7DCCB]';
  const hoverStyles = hover ? 'hover:shadow-[0_6px_24px_rgba(215,119,6,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
