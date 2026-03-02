import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Users,
  Heart
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-blue-100 py-16 shadow-inner">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white text-6xl md:text-8xl font-bold opacity-10 select-none font-serif">
          Jesus is the King
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Church Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Groupe Protestant</h2>
                <p className="text-blue-300 text-sm">A Community of Faith & Hope</p>
              </div>
            </div>
            
            <p className="text-blue-300/80 text-sm leading-relaxed">
              We are a community dedicated to worshiping God, serving others, 
              and spreading the message of hope through faith in Jesus Christ.
            </p>
            
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Clock className="w-4 h-4" />
              <span>Sundays: 9:00 AM & 11:00 AM</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Users className="w-4 h-4" />
              <span>Midweek: Wednesdays 7:00 PM</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-blue-700/50 inline-block">
              Explore More
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Worship Services", path: "/services" },
                { name: "Bible Study", path: "/bible-study" },
                { name: "Events", path: "/events" },
                { name: "Ministries", path: "/ministries" },
                { name: "Resources", path: "/resources" },
                { name: "Give Online", path: "/give" },
                { name: "Prayer Request", path: "/prayer" }
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.path}
                    className="group flex items-center text-blue-300 hover:text-white transition-all duration-300"
                  >
                    <div className="w-1 h-1 rounded-full bg-blue-500 mr-3 group-hover:w-2 group-hover:h-2 group-hover:bg-cyan-400 transition-all duration-300"></div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {item.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-blue-700/50 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-blue-900/40 group-hover:bg-blue-800/60 transition-colors duration-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Our Location</p>
                  <p className="text-blue-300/80 text-sm mt-1">
                    Kigali, Rwanda
                  </p>
                  <p className="text-blue-400/70 text-xs mt-1">
                    Near City Center, Main Street
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-blue-900/40 group-hover:bg-blue-800/60 transition-colors duration-300">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Call Us</p>
                  <p className="text-blue-300/80 text-sm mt-1">
                    +250 788 123 456
                  </p>
                  <p className="text-blue-400/70 text-xs mt-1">
                    Monday-Friday, 8AM-5PM
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-blue-900/40 group-hover:bg-blue-800/60 transition-colors duration-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Us</p>
                  <p className="text-blue-300/80 text-sm mt-1">
                    contact@groupeprotestant.org
                  </p>
                  <p className="text-blue-400/70 text-xs mt-1">
                    pastoralcare@groupeprotestant.org
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-blue-900/40 group-hover:bg-blue-800/60 transition-colors duration-300">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Visit Online</p>
                  <p className="text-blue-300/80 text-sm mt-1">
                    www.groupeprotestant.org
                  </p>
                  <p className="text-blue-400/70 text-xs mt-1">
                    Live streaming available
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-blue-700/50 inline-block">
              Stay Connected
            </h3>
            
            {/* Newsletter */}
            <div className="mb-8">
              <p className="text-blue-300/80 text-sm mb-4">
                Subscribe to our newsletter for updates and devotionals
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-blue-900/40 border border-blue-700/50 rounded-l-lg text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button className="px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-r-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-blue-300/80 text-sm mb-4">Follow us on social media:</p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-blue-900/40 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-blue-900/40 hover:bg-gradient-to-br hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-blue-900/40 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-blue-900/40 hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
                  aria-label="Website"
                >
                  <Globe className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-blue-400/80 text-sm">
                © {new Date().getFullYear()} Groupe Protestant. All rights reserved.
              </p>
              <p className="text-blue-500/60 text-xs mt-2">
                A registered non-profit organization | Tax ID: 123-456-789
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/privacy" className="text-blue-400/80 hover:text-cyan-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-blue-400/80 hover:text-cyan-300 transition-colors">
                Terms of Service
              </a>
              <a href="/sitemap" className="text-blue-400/80 hover:text-cyan-300 transition-colors">
                Sitemap
              </a>
              <a href="/accessibility" className="text-blue-400/80 hover:text-cyan-300 transition-colors">
                Accessibility
              </a>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-8 text-center">
            <p className="text-blue-300/70 text-sm italic max-w-3xl mx-auto">
              "To know Christ and make Him known through worship, discipleship, 
              and service to our community and the world."
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}