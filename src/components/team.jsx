const TeamSection = ({ team = [] }) => {
  if (!team.length) {
    return (
      <section className="text-center py-20 text-gray-500">
        No team members available.
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 bg-gray-100">
      <h2
        className="text-3xl font-bold text-center mb-12"
        style={{ color: "rgb(23,207,220)" }}
      >
        Our Team
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {team.map((member) => (
          <div
            key={member._id}
            className="bg-white rounded-xl shadow-md p-5 text-center"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="font-bold">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
