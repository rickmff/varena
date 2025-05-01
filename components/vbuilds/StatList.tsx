export function StatList({ stats }: { stats: Array<any> }) {
  return (
    <ul className="space-y-2">
      {stats.map((stat, index) => {
        const totalValue = stat.finalValue;
        const progressWidth = stat.cap
          ? Math.min((totalValue / stat.cap) * 100, 100)
          : 100;

        return (
          <li key={index} className="p-2 bg-gray-800 rounded">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{stat.name}</span>
              <span className="font-medium">
                {stat.cap
                  ? `${totalValue} / ${stat.cap}${stat.unit}`
                  : `${totalValue}${stat.unit}`}
              </span>
            </div>
            {stat.cap && (
              <div className="w-full bg-gray-700 rounded h-2">
                <div
                  className="bg-red-500 h-2 rounded"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
