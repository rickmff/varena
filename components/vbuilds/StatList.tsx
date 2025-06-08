export function StatList({ stats }: { stats: Array<any> }) {
  return (
    <ul className="space-y-4">
      {stats.map((stat, index) => {
        const totalValue = stat.finalValue;
        const defaultValue = stat.defaultValue || 0;

        const progressWidth = stat.cap
          ? Math.min(
              ((totalValue - defaultValue) / (stat.cap - defaultValue)) * 100,
              100
            )
          : 100;

        const overCap = stat.cap && totalValue > stat.cap;

        return (
          <li
            key={index}
            className={`rounded text-sm ${overCap ? "animate-pulse" : ""}`}
          >
            <div className={`flex justify-between mb-1`}>
              <span className={`font-medium ${overCap ? "text-white" : ""}`}>
                {stat.name}
              </span>
              <span className="text-sm">
                {stat.cap ? (
                  <>
                    <span
                      className={`font-bold ${
                        overCap
                          ? "text-red-800"
                          : progressWidth === 0
                          ? "text-zinc-500"
                          : "text-red-400"
                      }`}
                    >
                      {totalValue}
                    </span>{" "}
                    /{" "}
                    <span>
                      {stat.cap}
                      {stat.unit}
                    </span>
                  </>
                ) : (
                  <span>
                    {totalValue}
                    {stat.unit}
                  </span>
                )}
              </span>
            </div>
            {stat.cap && (
              <div className={`w-full bg-zinc-600 rounded h-2`}>
                <div
                  className={`${
                    overCap ? "bg-red-800" : "bg-red-400"
                  } h-2 rounded`}
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
