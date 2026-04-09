import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SistersCard = ({ team = [], section }) => {
  const sectionRef = useRef(null);

  const founders = team
    .filter(
      (m) =>
        m.role === "Founder" &&
        (m.name === "Amelia Wyler" || m.name === "Vienna Wyler")
    )
    .sort((a, b) => (a.name === "Amelia Wyler" ? -1 : 1));

  useEffect(() => {
    if (!founders.length || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [founders]);

  return (
    <section
      ref={sectionRef}
      className="max-w-5xl mx-auto my-32 p-10 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          {founders.map((f) => (
            <img
              key={f._id}
              src={f.image}
              alt={f.name}
              className="w-24 h-24 rounded-full object-cover shadow-md"
            />
          ))}
        </div>

        <h2
          className="text-3xl md:text-4xl font-bold text-center"
          style={{ color: "rgb(242, 30, 167)" }}
        >
          {section?.title}
        </h2>
      </div>

      <p className="text-gray-700 text-lg text-justify mt-8">
        {section?.description?.map((p, i) => (
          <span
            key={i}
            style={p.highlight ? { color: "rgb(23,207,220)" } : undefined}
          >
            {p.text + " "}
          </span>
        ))}
      </p>
    </section>
  );
};

export default SistersCard;
