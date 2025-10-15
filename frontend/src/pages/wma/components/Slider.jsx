import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function SliderComponent() {
  const slides = [
    {
      title: "Add Collectors to the System",
      description:
        "Easily onboard new collectors to the system, enabling efficient waste management and tracking of performance.",
    },
    {
      title: "View Collector Schedules",
      description:
        "Access and manage schedules assigned by the admin to your collectors, ensuring timely pickups and organized operations.",
    },
    {
      title: "Track Your Income",
      description:
        "Monitor your earnings through transactions and get insights into your financial performance over time.",
    },
    {
      title: "Update Your Profile",
      description:
        "Keep your information up to date. Update your profile to reflect any changes in contact information or services offered.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="rounded-xl relative h-[25vh] min-h-[300px] w-full overflow-hidden bg-gradient-to-br from-green-800 to-green-600 shadow-2xl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')] opacity-20"></div>

      <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-amber-300 mb-4 transition-all duration-700 ease-in-out transform">
          {slides[currentIndex].title}
        </h2>
        <p className="text-xl md:text-lg text-gray-100 max-w-2xl transition-all duration-700 ease-in-out transform">
          {slides[currentIndex].description}
        </p>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-amber-300 w-6"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-amber-300 transition-all duration-300 ease-in-out"
          style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
        ></div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 rounded-full p-2"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 rounded-full p-2"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
