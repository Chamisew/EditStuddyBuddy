const WasteSolutions = () => {
  const solutions = [
    {
      title: "Smart Waste Solutions",
      description:
        "Track waste collection using smart devices attached to your bins. Real-time monitoring and data analytics for efficient waste management.",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Smart waste bin with digital display",
    },
    {
      title: "Area-based Pricing",
      description:
        "Customized pricing models based on location, waste volume, and collection frequency. Fair and transparent billing system.",
      image:
        "https://images.unsplash.com/photo-1726137569772-791c3b20b4cf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Digital map showing different pricing zones",
    },
    {
      title: "Authority Registration",
      description:
        "Streamlined process for waste management authority registrations. Ensure compliance with local regulations and standards.",
      image:
        "https://plus.unsplash.com/premium_photo-1663040117567-ab8441cb7b04?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Registration portal interface",
    },
    {
      title: "Vehicle Tracking",
      description:
        "Real-time GPS tracking of garbage collection vehicles. Optimize routes and monitor collection schedules efficiently.",
      image:
        "https://plus.unsplash.com/premium_photo-1661963024527-c855211ad31d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Vehicle tracking system interface",
    },
  ];

  return (
    <div className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-green-600 text-lg uppercase font-semibold tracking-wide mb-">
            WASTE MANAGEMENT SERVICES
          </h3>
          <h2 className="text-[3.5rem] font-semibold text-gray-900 ">
            Smart Solutions
          </h2>
        </div>
        <div className="mt- text-center mb-10">
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our comprehensive waste management solutions are designed to make
            waste collection and processing more efficient, environmentally
            friendly, and cost-effective for communities.
          </p>
          <button className="mt-8 bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors duration-300">
            Learn More
          </button>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={solution.image}
                  alt={solution.alt}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  {solution.title}
                </h3>
                <p className="text-gray-600 text-sm">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
      </div>
    </div>
  );
};

export default WasteSolutions;
