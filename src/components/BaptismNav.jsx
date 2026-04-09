import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, UserCheck, Shield } from "lucide-react";

export default function BaptismNav({ isAdmin = false }) {
  const { pathname } = useLocation();

  const Item = ({ to, icon, label }) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="flex flex-wrap gap-2">
        <Item to="/baptism" icon={<BookOpen size={15} />} label="Baptism" />
        <Item
          to="/baptism/my-classes"
          icon={<UserCheck size={15} />}
          label="My Classes"
        />
        {isAdmin && (
          <Item
            to="/admin/baptism"
            icon={<Shield size={15} />}
            label="Admin Panel"
          />
        )}
      </div>
    </div>
  );
}
