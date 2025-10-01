'use client';

import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Si el contenido no tiene tags HTML, tratarlo como texto plano
  const isHTML = content.includes('<') && content.includes('>');
  
  if (!isHTML) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div 
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;