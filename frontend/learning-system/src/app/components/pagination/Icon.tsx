import React from "react";

interface IconProps {
  svg: string;
  width?: number;
  height?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  svg,
  width = 16,
  height = 16,
  className = "",
}) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default Icon;
