import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, UserCheck, Shield } from "lucide-react";

export default function BaptismNav({ isAdmin = false }) {
  const { pathname } = useLocation();

  const Item = ({ to, icon, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
          active
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
        }`}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="flex flex-wrap gap-2">
        <Item to="/baptism" icon={<BookOpen size={18} />} label="Baptism" />
        <Item
          to="/baptism/my-classes"
          icon={<UserCheck size={18} />}
          label="My Classes"
        />
        {isAdmin && (
          <Item to="/admin/baptism" icon={<Shield size={18} />} label="Admin" />
        )}
      </div>
    </div>
  );
}