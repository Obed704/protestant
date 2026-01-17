import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/team`);
        if (!res.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await res.json();

        // Normalize image URLs and sort founders/advisors first
        const formatted = data
          .map((member) => ({
            ...member,
            image: member.image ? `${BACKEND_URL}${member.image}` : "",
          }))
          .sort((a, b) => {
            // Make Amelia Wyler first
            if (a.name === "Amelia Wyler") return -1;
            if (b.name === "Amelia Wyler") return 1;

            // Then founders/advisors
            const priorityRoles = ["founder", "advisor"];
            const aPriority = priorityRoles.includes(a.role.toLowerCase())
              ? -1
              : 0;
            const bPriority = priorityRoles.includes(b.role.toLowerCase())
              ? -1
              : 0;
            return aPriority - bPriority;
          });

        setTeamMembers(formatted);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500">Loading team members…</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 bg-gray-100">
      <h2
        className="text-3xl font-bold text-center mb-12"
        style={{ color: "rgb(23, 207, 220)" }}
      >
        Our Team
      </h2>

      {teamMembers.length === 0 ? (
        <p className="text-center text-gray-500">No team members available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center p-5 flex flex-col items-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-4 shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "/avatar-placeholder.png";
                }}
              />

              <h3 className="text-lg font-bold text-gray-800 mb-1 capitalize break-words text-center">
                {member.name}
              </h3>

              <p className="text-sm text-gray-500 mb-2 capitalize break-words text-center">
                {member.role}
              </p>

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm break-all text-blue-600 hover:text-blue-500 underline text-center"
                >
                  {member.email}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeamSection;
