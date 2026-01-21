"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {items.map((item) => (
        <AccordionItem 
          key={item.id} 
          value={item.id}
          className="border border-border rounded-xl px-6 bg-card hover:bg-secondary/30 transition-colors"
        >
          <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
            {typeof item.answer === 'string' ? (
              <p>{item.answer}</p>
            ) : (
              item.answer
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
