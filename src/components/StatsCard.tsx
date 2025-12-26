interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export const StatsCard = ({ icon, value, label }: StatsCardProps) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

