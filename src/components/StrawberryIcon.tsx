import React from 'react';
import Image from 'next/image';

export function StrawberryIcon({ className = "inline w-4 h-4 mb-0.5 ml-0.5" }) {
  return (
    <Image 
      src="/icon/pink-diamond.png" 
      alt="Pink Diamond" 
      width={16} 
      height={16} 
      className={`object-contain inline-block ${className}`}
      unoptimized
    />
  );
}
