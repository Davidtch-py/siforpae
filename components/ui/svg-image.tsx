import React from 'react';

interface SvgImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const SvgImage: React.FC<SvgImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
}) => {
  // Asegurarse de que la ruta comienza con una barra para acceder desde la carpeta public
  const imagePath = src.startsWith('/') ? src : `/${src}`;
  
  return (
    <img
      src={imagePath}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}; 