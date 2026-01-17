import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SistersCard = () => {
  const [founders, setFounders] = useState([]);
  const [section, setSection] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => { gsap.registerPlugin(ScrollTrigger); }, []);

  // Fetch founders
  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/team`);
        const data = await res.json();
        const foundersOnly = data
          .filter(
            (m) =>
              m.role === "Founder" &&
              (m.name === "Amelia Wyler" || m.name === "Vienna Wyler")
          )
          .sort((a, b) => (a.name === "Amelia Wyler" ? -1 : 1))
          .map(f => ({ ...f, image: `${BACKEND_URL}${f.image}` }));
        setFounders(foundersOnly);
      } catch (err) { console.error(err); }
    };
    fetchFounders();
  }, []);

  // Fetch section text
  useEffect(() => {
    const fetchSection = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/sections/sisters_card`);
        const data = await res.json();
        setSection(data);
      } catch (err) { console.error(err); }
    };
    fetchSection();
  }, []);

  // GSAP animation
  useEffect(() => {
    if (founders.length && sectionRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 85%" } }
        );
        gsap.fromTo(
          ".sister-image",
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)", stagger: 0.2, scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
        );
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [founders]);

  return (
    <section
      ref={sectionRef}
      className="sisters-card max-w-5xl mx-auto my-32 p-10 bg-white rounded-2xl shadow-lg border border-gray-200"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row gap-4">
          {founders.map((founder, i) => (
            <div
              key={i}
              className="sister-image w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md hover:scale-105 transition-transform duration-300"
            >
              <img src={founder.image} alt={founder.name} className="w-full h-full object-cover rounded-full" />
            </div>
          ))}
        </div>

        <h2
          className="text-3xl md:text-4xl font-bold text-center mt-4 lg:mt-0 capitalize"
          style={{ color: "rgb(242, 30, 167)" }}
        >
          {section?.title || "sisters in STEM"}
        </h2>
      </div>

      {/* Single paragraph with selective highlights */}
      <p className="text-gray-700 text-base md:text-lg leading-relaxed text-justify max-w-3xl mx-auto mt-8">
        {section?.description?.map((p, i) => (
          <span
            key={i}
            style={p.highlight ? { color: "rgb(23, 207, 220)" } : undefined}
          >
            {p.text + " "}
          </span>
        ))}
      </p>
    </section>
  );
};

export default SistersCard;
