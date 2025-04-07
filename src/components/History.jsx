import { useSelector } from "react-redux";
import { formatTime } from "../utils";

const History = () => {
  const history = useSelector((state) => state.history.entries);

  return (
    <div className="p-4 bg-gray-900 h-[calc(100vh-60px)] text-white">
      <h2 className="text-xl font-bold mb-4">Completed Timers</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-4 py-2">Date</th>
              <th className="border border-gray-700 px-4 py-2">Clock Name</th>
              <th className="border border-gray-700 px-4 py-2">Timer Set</th>
              <th className="border border-gray-700 px-4 py-2">Time Spent</th>
              <th className="border border-gray-700 px-4 py-2">% Completed</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              history.reduce((acc, entry) => {
                const date = new Date(entry.id).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                if (!acc[date]) acc[date] = [];
                acc[date].push(entry);
                return acc;
              }, {})
            )
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([date, entries], index) => {
                const bgColor =
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-700";

                return entries.map(
                  ({ id, label, timeSet, timeSpent, percentageCompleted }, i) => (
                    <tr key={id} className={bgColor}>
                      {i === 0 && (
                        <td
                          rowSpan={entries.length}
                          className="border border-gray-600 px-4 py-2 font-bold text-blue-400 text-center"
                        >
                          {date}
                        </td>
                      )}
                      <td className="border border-gray-600 px-4 py-2">
                        {label}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {formatTime(timeSet)}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {formatTime(timeSpent)}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {percentageCompleted}%
                      </td>
                    </tr>
                  )
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History; 