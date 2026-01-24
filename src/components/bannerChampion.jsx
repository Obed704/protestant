const Banner = ({ bannerData }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  if (!bannerData) return null;

  return (
    <section className="relative w-full h-screen overflow-hidden" id="home">
      {/* Background image */}
      <img
        src={`${BACKEND_URL}${bannerData.image?.startsWith("/") ? "" : "/"}${bannerData.image}`}
        alt="Women in STEM"
        className="w-full h-full object-cover object-center brightness-75 transition-all duration-500 hover:brightness-90"
      />

      {/* Text overlay */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/90 text-center p-8 rounded-xl shadow-lg max-w-4xl w-[90%] animate-fadeInUp">
        <h3
          className="text-3xl md:text-4xl mb-6 font-orbitron uppercase"
          style={{ color: bannerData.primaryColor || "rgb(23, 207, 220)" }}
        >
          {bannerData.title}
        </h3>

        <p className="text-gray-700 text-base md:text-lg">
          {bannerData.description}
        </p>
      </div>
    </section>
  );
};

export default Banner;
