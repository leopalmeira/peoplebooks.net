import React from 'react';

interface Book3DProps {
  coverUrl?: string;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Book3D: React.FC<Book3DProps> = ({
  coverUrl = '/assets/cover.png',
  title = 'Histórias que Inspiram',
  subtitle = 'Volume 01',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-[200px]',
    md: 'max-w-[260px] sm:max-w-[300px]',
    lg: 'max-w-[280px] sm:max-w-[360px] lg:max-w-[400px]',
  }[size];

  return (
    <div className={`relative flex items-center justify-center p-2 ${className}`}>
      {/* Pure Transparent 3D Book Cutout */}
      <div className={`relative w-full ${sizeClasses} transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]`}>
        <img
          src={coverUrl}
          alt={`${title} - ${subtitle}`}
          className="w-full h-auto object-contain select-none pointer-events-none filter drop-shadow-[0_20px_35px_rgba(20,44,36,0.18)]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('cover.png')) {
              target.src = '/assets/cover.png';
            }
          }}
        />
      </div>
    </div>
  );
};
