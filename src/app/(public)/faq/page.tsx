import type { Metadata } from "next";
import { RULES_SUMMARY } from "@/lib/tournament-rules";
import { PageHero } from "@/components/public/page-hero";
import { RegisterInterestLink } from "@/components/public/register-interest-link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Corporate Cricket Tournament FAQs",
  description: "Answers about One Dream Cup corporate team eligibility, city leagues, Goa qualification, dates, entry fees and registration.",
  alternates: { canonical: "/faq" },
};

const questions = [
  ["Is this tournament only for companies?", RULES_SUMMARY.eligibility],
  ["Does an enquiry reserve a team slot?", "No. An enquiry starts a conversation. A slot is reserved only when the operations team explicitly confirms it."],
  ["How many matches will we play?", "Each city competition progresses through league matches, pre-quarter-finals, quarter-finals and semi-finals. The brochure does not guarantee a minimum number of matches."],
  ["What is the match format?", RULES_SUMMARY.format],
  ["How do teams reach Goa?", "The top two teams from each of Bangalore, Chennai, Hyderabad and Pune qualify for the eight-team quarter-finals in Goa and receive ₹10,000 each as base compensation for Goa travel. No other travel compensation is provided."],
  ["When and where are the matches?", "Bangalore plays 21–22 November 2026, Pune 12–13 December 2026, Hyderabad 19–20 December 2026, and Chennai 30–31 January 2027. Venues have not yet been published."],
  ["What is the cash prize?", "The total cash prize is ₹2,80,000: ₹1,50,000 for the winner, ₹50,000 for the runner-up, and ₹10,000 for each of the eight qualifying teams’ Goa travel."],
  ["What is the entry fee?", "The listed team fee is ₹14,500. GST treatment, payment schedule and refund terms will be confirmed before payment."],
  ["Do I need a player roster to enquire?", "No. Player details are collected after a registration invitation. The playing side is 11; the brochure does not specify a total squad limit."],
] as const;

export default function FaqPage() {
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} /><PageHero eyebrow="Frequently asked questions" title="Straight answers before you commit."><p>Known tournament facts are stated clearly. Operational details that are not confirmed remain marked as such.</p></PageHero><section className="section-pad bg-[#f7f3ea]"><div className="container-shell grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><div><h2 className="text-3xl text-[#081326]">Need a team-specific answer?</h2><p className="mt-4 text-sm leading-7 text-slate-600">Send a short enquiry or contact the operations team on WhatsApp. Include your company and city.</p><RegisterInterestLink className="mt-6" /></div><Accordion className="bg-white px-6" defaultValue={["q-0"]}>{questions.map(([question,answer],index)=><AccordionItem key={question} value={`q-${index}`}><AccordionTrigger className="py-5 text-left font-semibold text-[#081326]">{question}</AccordionTrigger><AccordionContent className="pb-5 leading-7 text-slate-600">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section></>;
}
