import React from "react";
import { motion } from "framer-motion";

/* Official STEM color palette */
const colors = [
  "rgb(247, 244, 46)",   // Yellow
  "rgb(23, 207, 220)",   // Cyan
  "rgb(242, 30, 167)",   // Pink
];

/* Word-based colored title */
const StemInspiresTitle = () => (
  <span className="flex gap-2">
    <span style={{ color: colors[0] }}>STEM</span>
    <span style={{ color: colors[1] }}>Inspires</span>
  </span>
);

const footerData = {
  info: {
    description:
      "Inspiring the next generation of innovators through hands-on STEM education.",
  },
  quickLinks: [
    { name: "Home", href: "/" },
    { name: "Our Project", href: "/ourProjects" },
    { name: "Donate", href: "/donate" },
    { name: "Champions", href: "/champions" },
  ],
  programs: [
    { name: "Resources", href: "/resources" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  contact: [
    { text: "info@steminspires.tech", href: "mailto:info@steminspires.tech" },
  ],
};

const Footer = () => {
  const listVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
      },
    }),
  };

  return (
    <footer className="relative bg-gray-900 text-white py-16 px-6 md:px-20 overflow-hidden">
      <motion.div
        className="relative grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">
            <StemInspiresTitle />
          </h3>
          <p className="mb-4 text-gray-300">
            {footerData.info.description}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {footerData.quickLinks.map((link, idx) => (
              <motion.li
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={listVariants}
              >
                <a href={link.href} className="hover:text-blue-400 transition">
                  {link.name}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div>
          <h3 className="text-xl font-bold mb-4">Programs</h3>
          <ul className="space-y-2">
            {footerData.programs.map((link, idx) => (
              <motion.li
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={listVariants}
              >
                <a href={link.href} className="hover:text-blue-400 transition">
                  {link.name}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <ul className="space-y-2">
            {footerData.contact.map((item, idx) => (
              <motion.li
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={listVariants}
              >
                <a href={item.href} className="hover:text-blue-400 transition">
                  {item.text}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} STEM Inspires. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
