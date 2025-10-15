import { useEffect, useState } from "react";
import WMADrawer from "../components/WMADrawer";
import SliderComponent from "../components/Slider";
import { DollarSign, TrendingUp, Trash } from "lucide-react";
import { getAllCollectorsInWma } from "../../../api/collectorApi";
import { getAllSchedulesInWma } from "../../../api/scheduleApi";
import AuthService from "../../../api/wmaApi";

const WMADashboard = () => {
  const [totalIncome, setTotalIncome] = useState(15000);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [registeredCollectors, setRegisteredCollectors] = useState(0);
  const [wmaId, setWmaId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wmaDetails = await AuthService.getCurrentWmaDetails();
        const currentWmaId = wmaDetails._id;
        setWmaId(currentWmaId);

        // Fetch total schedules
        const schedules = await getAllSchedulesInWma(currentWmaId);
        setTotalSchedules(schedules.length);

        // Fetch total collectors
        const collectors = await getAllCollectorsInWma(currentWmaId);
        setRegisteredCollectors(collectors.length);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []); // Run this effect once on component mount

  const metrics = [
    {
      title: "Total Income",
      value: totalIncome,
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      color: "border-l-green-500",
    },
    {
      title: "Total Schedules",
      value: totalSchedules,
      icon: <TrendingUp className="h-6 w-6 text-red-500" />,
      color: "border-l-red-500",
    },
    {
      title: "Registered Collectors",
      value: registeredCollectors,
      icon: <Trash className="h-6 w-6 text-orange-500" />,
      color: "border-l-orange-500",
    },
  ];

  return (
    <WMADrawer>
      <div className="p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">
          Waste Management Authority Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
        <SliderComponent />
      </div>
    </WMADrawer>
  );
};

const MetricCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("border-l-", "bg-")
          .replace("500", "100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default WMADashboard;
