import React, { useState, useEffect } from 'react';
import { CategoryId, EDITORIAL_IMAGES } from '../services/rssService';

interface SourceImageProps {
  src: string;
  alt: string;
  category: Exclude<CategoryId, 'all'>;
  className?: string;
}

export const SourceImage: React.FC<SourceImageProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-full object-cover',
}) => {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'fallback'>('direct');

  useEffect(() => {
    setStage('direct');
  }, [src]);

  const fallbackImg = EDITORIAL_IMAGES[category] || EDITORIAL_IMAGES.tech;

  let activeSrc = src || fallbackImg;
  if (stage === 'proxy' && src.startsWith('http')) {
    activeSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`;
  } else if (stage === 'fallback') {
    activeSrc = fallbackImg;
  }

  const handleError = () => {
    if (stage === 'direct' && src.startsWith('http')) {
      setStage('proxy');
    } else if (stage !== 'fallback') {
      setStage('fallback');
    }
  };

  return (
    <img
      src={activeSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="eager"
      decoding="async"
      onError={handleError}
      className={`block ${className}`}
    />
  );
};
