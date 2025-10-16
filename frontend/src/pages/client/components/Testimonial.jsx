const WasteManagementStats = () => {
  return (
    <section className="px-6 md:px-20 mx-auto py-24 max-w-7xl">
      {/* Header and Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Title */}
        <div className="md:col-span-1">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Impressive waste management metrics driving sustainability.
          </h2>
          <p className="mt-4 text-gray-600">
            Powerful outcomes from our operations — higher recycling rates and
            optimized collection for healthier communities.
          </p>
        </div>

        {/* Statistics */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stat 1 */}
          <div
            className="bg-gradient-to-tr from-green-600 to-green-500 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-center"
            aria-label="Waste recycling rate"
          >
            <div className="flex items-center space-x-4">
              <span className="text-6xl md:text-8xl font-extrabold leading-tight">
                92%
              </span>
              <svg
                className="w-8 h-8 text-green-100 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold">
              Waste recycling rate
            </h3>
            <p className="mt-2 text-green-100">
              Successfully processed and recycled materials from the total waste
              collected across our service areas.
            </p>
          </div>

          {/* Stat 2 */}
          <div
            className="bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-center"
            aria-label="Collection efficiency"
          >
            <div className="flex items-center space-x-4">
              <span className="text-6xl md:text-8xl font-extrabold leading-tight">
                95%
              </span>
              <svg
                className="w-8 h-8 text-emerald-100 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold">
              Collection efficiency
            </h3>
            <p className="mt-2 text-emerald-100">
              On-time pickup and efficient waste collection, improving
              reliability and service coverage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WasteManagementStats;
