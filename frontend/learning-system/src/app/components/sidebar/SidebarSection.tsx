import React, { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <section className="mb-8">
      <h3 className="mb-5 text-xl font-semibold text-black max-sm:text-2xl">
        {title}
      </h3>
      {children}
    </section>
  );
};

export default SidebarSection;
