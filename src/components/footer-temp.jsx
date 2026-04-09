import React from "react";
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
  Heart,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-300">
      {/* Top Decoration Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Section 1: Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Groupe <span className="text-emerald-500">Protestant</span>
              </h2>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              A community dedicated to worshiping God and spreading hope through
              faith in Jesus Christ.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Sundays: 9:00 AM & 11:00 AM</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Midweek: Wed 7:00 PM</span>
              </div>
            </div>
          </div>

          {/* Section 2: Navigation - Mobile Friendly Grid */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3">
              {[
                "Home",
                "Services",
                "Ministries",
                "Bible Study",
                "Events",
                "Give Online",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="flex items-center text-slate-400 hover:text-emerald-400 font-medium text-sm transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
              Contact
            </h3>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-white">Kigali, Rwanda</p>
                  <p className="text-slate-400">Main Street, City Center</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-white">+250 788 123 456</p>
                  <p className="text-slate-400">Available Mon-Fri</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-sm overflow-hidden">
                  <p className="font-bold text-white text-xs md:text-sm truncate">
                    contact@groupeprotestant.org
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Section 4: Connect */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
              Stay Connected
            </h3>
            <div className="flex gap-3">
              {[
                {
                  icon: <Facebook />,
                  color: "hover:bg-blue-900/30 hover:text-blue-400",
                },
                {
                  icon: <Instagram />,
                  color: "hover:bg-pink-900/30 hover:text-pink-400",
                },
                {
                  icon: <Youtube />,
                  color: "hover:bg-red-900/30 hover:text-red-400",
                },
                {
                  icon: <Globe />,
                  color: "hover:bg-emerald-900/30 hover:text-emerald-400",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className={`p-3 rounded-xl bg-slate-900 text-slate-500 transition-all duration-300 border border-slate-800 ${social.color}`}
                >
                  {React.cloneElement(social.icon, { size: 20 })}
                </a>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 italic text-slate-400 text-xs leading-relaxed">
              "To know Christ and make Him known through worship and service."
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium order-2 md:order-1 text-center md:text-left">
            © {currentYear} Groupe Protestant. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 order-1 md:order-2">
            {["Privacy Policy", "Terms", "Accessibility"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
