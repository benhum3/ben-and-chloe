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
      "Rooms at Longridge House have been reserved for immediate family. The Derby Arms and other nearby accommodation may be suitable for guests.",
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
      className="scroll-mt-28 bg-[#181818] py-24 text-[#f8f6f2] md:py-32"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#C79A61]">
              Useful Information
            </p>

            <h2 className="mt-6 font-serif text-5xl leading-none md:text-7xl">
              Questions
            </h2>

            <p className="mt-8 max-w-sm text-sm leading-8 text-neutral-400">
              A few helpful details before the day. Please contact us directly
              if there is anything else you need to know.
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
                    onClick={() =>
                      setOpenQuestion(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-8 py-7 text-left"
                  >
                    <span className="font-serif text-2xl md:text-3xl">
                      {item.question}
                    </span>

                    <span
                      className={`shrink-0 text-2xl font-light text-[#C79A61] transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ${
                      isOpen
                        ? "grid-rows-[1fr] pb-7 opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl text-sm leading-8 text-neutral-400">
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