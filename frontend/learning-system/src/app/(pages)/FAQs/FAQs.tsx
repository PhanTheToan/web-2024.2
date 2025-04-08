"use client";

import { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface AccordionItemProps {
  title: string;
  content: string;
}

export default function AccordionItem({ title, content }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion
      expanded={isOpen}
      onChange={() => setIsOpen(!isOpen)}
      className="transition-all duration-300 hover:bg-gray-100"
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon style={{ color: isOpen ? "#FF782D" : "#000" }} />} 
        sx={{
          color: isOpen ? "#FF782D" : "#000", // Đổi màu chữ dựa trên trạng thái
          fontWeight: isOpen ? "bold" : "bold", // Khi mở thì in đậm
        }}
      >
        {title}
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
}
