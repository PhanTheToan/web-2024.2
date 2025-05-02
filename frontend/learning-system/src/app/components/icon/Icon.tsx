import React from "react";

interface IconProps {
  svg: string;
  width?: number;
  height?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ svg, width, height, className }) => {
  return (
    <span
      className={className}
      style={{ width: width || 16, height: height || 16 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Icon;