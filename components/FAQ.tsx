"use client";

import { useState } from "react";
import Container from "./Container";

const questions = [
  {
    question: "What time should I arrive?",
    answer:
      "Guests are kindly asked to arrive at St Andrew's Church from 12:00pm. The ceremony will begin promptly at 12:30pm.",
  },
  {
    question: "What is the dress code?",
    answer:
      "The dress code is formal. We would love everyone to dress for a special winter celebration.",
  },
  {
    question: "Where will the reception take place?",
    answer:
      "The reception will take place at Longridge House following the church ceremony.",
  },
  {
    question: "Is accommodation available?",
    answer:
      "Rooms at Longridge House have been reserved for immediate family. Please see the Travel & Stay section above for our nearby accommodation recommendation.",
  },
  {
    question: "Do you have a gift list?",
    answer:
      "Your presence is the greatest gift. For anyone who would still like to give something, a contribution towards our honeymoon would be warmly appreciated.",
  },
  {
    question: "When should I respond by?",
    answer:
      "Please submit your RSVP by 1 September 2026. You can return to the RSVP page later if you need to update your response.",
  },
];

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-28 bg-[#181818] py-20 text-[#f8f6f2] md:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#C79A61] md:text-[11px] md:tracking-[0.38em]">
              Useful Information
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.02] md:mt-6 md:text-7xl">
              Frequently
              <span className="block">Asked Questions</span>
            </h2>

            <p className="mt-6 max-w-sm text-base leading-7 text-neutral-400 md:mt-8 md:text-sm md:leading-8">
              We&apos;ve answered a few of the questions we&apos;re asked most
              often. If there&apos;s anything else you&apos;d like to know,
              please don&apos;t hesitate to get in touch.
            </p>
          </div>

          <div className="border-t border-white/15">
            {questions.map((item, index) => {
              const isOpen = openQuestion === index;

              return (
                <article
                  key={item.question}
                  className="border-b border-white/15"
                >
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left md:gap-8 md:py-7"
                  >
                    <span className="font-serif text-2xl leading-tight transition-colors duration-300 group-hover:text-[#C79A61] md:text-3xl">
                      {item.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl font-light text-[#C79A61]"
                    >
                      {isOpen ? "×" : "+"}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] pb-6 opacity-100 md:pb-7"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl text-base leading-7 text-neutral-400 md:text-sm md:leading-8">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}