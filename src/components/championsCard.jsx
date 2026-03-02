import React from 'react';

const ChampionCard = ({ champion, reverse }) => {
  return (
    <section
      className={`flex flex-col md:flex-row items-center justify-between bg-white shadow-lg rounded-xl overflow-hidden max-w-6xl mx-auto my-12 p-6 md:p-12 ${
        reverse ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Image Section */}
      <div className="relative w-full md:w-1/2 md:pr-6 md:pl-6 mb-6 md:mb-0">
        <img
          src={champion.image} // Use full URL from prop
          alt={champion.alt || champion.title}
          className="w-full h-80 md:h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
      </div>

      {/* Text Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center md:pl-8 md:pr-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "rgb(23, 207, 220)" }}>
          {champion.title}
        </h2>

        {champion.season && (
          <p className=" font-medium italic mb-4" style={{ color: "rgb(242, 30, 167)" }}>
            Season: {champion.season}
          </p>
        )}

        <p className="text-gray-600 leading-relaxed mb-4">{champion.description}</p>

        {champion.roadToVictory && (
          <p className="text-gray-700 italic mb-4">{champion.roadToVictory}</p>
        )}

        {champion.cta && (
          <a
            href={champion.cta.link}
            className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
          >
            {champion.cta.text}
          </a>
        )}
      </div>
    </section>
  );
};

export default ChampionCard;
