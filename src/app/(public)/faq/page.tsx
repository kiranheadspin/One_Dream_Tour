import { PageHero } from "@/components/public/page-hero";
import { RegisterInterestLink } from "@/components/public/register-interest-link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const questions = [
  ["Is this tournament only for companies?", "Yes. One Dream Cup is designed for corporate teams. Company relationship and player eligibility details are verified during registration."],
  ["Does an enquiry reserve a team slot?", "No. An enquiry starts a conversation. A slot is reserved only when the operations team explicitly confirms it."],
  ["How many matches will we play?", "The league format guarantees at least two matches for every entered team."],
  ["What is the match format?", "Matches are played with a tennis ball over seven overs. Detailed playing conditions and tie-break rules will be published as a versioned rules document."],
  ["How do teams reach Goa?", "Two teams from each of Bangalore, Chennai, Hyderabad and Pune qualify for the eight-team quarter-finals in Goa."],
  ["When and where are the matches?", "The season window is September–December 2026. Exact dates and venues have not yet been published and will never be guessed on this site."],
  ["What is the entry fee?", "The listed team fee is ₹14,500. GST treatment, payment schedule and refund terms will be confirmed before payment."],
  ["Do I need a player roster to enquire?", "No. The public enquiry asks only for approximate team size. Player details are collected later, after a registration invitation."],
] as const;

export default function FaqPage() {
  return <><PageHero eyebrow="Frequently asked questions" title="Straight answers before you commit."><p>Known tournament facts are stated clearly. Operational details that are not confirmed remain marked as such.</p></PageHero><section className="section-pad bg-[#f7f3ea]"><div className="container-shell grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><div><h2 className="text-3xl text-[#081326]">Need a team-specific answer?</h2><p className="mt-4 text-sm leading-7 text-slate-600">Send a short enquiry or contact the operations team on WhatsApp. Include your company and city.</p><RegisterInterestLink className="mt-6" /></div><Accordion className="bg-white px-6" defaultValue={["q-0"]}>{questions.map(([question,answer],index)=><AccordionItem key={question} value={`q-${index}`}><AccordionTrigger className="py-5 text-left font-semibold text-[#081326]">{question}</AccordionTrigger><AccordionContent className="pb-5 leading-7 text-slate-600">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section></>;
}
