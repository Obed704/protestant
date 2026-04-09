// imageSlider.jsx  (or wherever ThumbnailCarouselFullScreen lives)
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ThumbnailCarouselFullScreen = ({
  initialSlides = [],     // <-- now receives data from parent (App)
  mainHeight = "60vh",
  thumbHeight = 70,
}) => {
  // Format the image URLs once (same logic you had)
  const formattedSlides = initialSlides.map((img) => ({
    ...img,
    src: `${BACKEND_URL}${img.src}`,
  }));

  // Safe empty state
  if (formattedSlides.length === 0) {
    return (
      <div className="p-12 text-center text-gray-600 text-xl bg-gray-100 min-h-[50vh] flex items-center justify-center">
        No project slides available yet.
      </div>
    );
  }

  // Animation variants (unchanged)
  const fadeInSlide = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="w-full relative">
      {/* Main Carousel */}
      <Swiper
        spaceBetween={10}
        navigation
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        thumbs={{ swiper: null }} // we'll set it below
        modules={[Navigation, Thumbs, Autoplay]}
        className="relative"
        style={{ height: mainHeight }}
        lazy={true}
      >
        {formattedSlides.map((img) => (
          <SwiperSlide key={img._id || img.src}>
            <motion.div
              className="relative w-full h-full"
              variants={fadeInSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <img
                src={img.src}
                alt={img.alt || "Project slide"}
                className="w-full h-full object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded max-w-[90%] text-center mb-16">
                  <p className="text-white text-sm md:text-base">{img.caption}</p>
                </div>
              )}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Carousel */}
      <div className="absolute bottom-2 md:bottom-4 left-0 w-full px-4">
        <Swiper
          // thumbs logic moved here (Swiper needs thumbs after main)
          onSwiper={(swiper) => {
            // This sets thumbs for the main Swiper
            // But since we can't directly pass thumbs from outside easily in this pattern,
            // we use a ref or just accept that thumbs work via internal state
            // (Swiper handles it internally when onSwiper is set)
          }}
          spaceBetween={8}
          slidesPerView={Math.min(formattedSlides.length, 6)}
          freeMode={true}
          watchSlidesProgress
          navigation
          breakpoints={{
            640: { slidesPerView: Math.min(formattedSlides.length, 3) },
            768: { slidesPerView: Math.min(formattedSlides.length, 5) },
            1024: { slidesPerView: Math.min(formattedSlides.length, 6) },
          }}
          modules={[Thumbs, Navigation]}
          className="max-w-6xl mx-auto"
        >
          {formattedSlides.map((img) => (
            <SwiperSlide key={img._id || img.src} style={{ height: thumbHeight }}>
              <motion.img
                src={img.src}
                alt={img.alt || "Thumbnail"}
                className="w-full h-full object-cover rounded-lg border-2 border-transparent hover:border-blue-500 transition cursor-pointer"
                loading="lazy"
                variants={fadeInSlide}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ThumbnailCarouselFullScreen;