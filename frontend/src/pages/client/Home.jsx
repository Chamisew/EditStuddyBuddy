import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import waste from "../../assets/1.png";
import global from "../../assets/2.png";
import commercial from "../../assets/3.png";
import residential from "../../assets/4.png";
import Footer from "./components/Footer";
import WasteManagementStats from "./components/Testimonial";

const Home = () => {
  return (
    <>
      <Navbar />

      <main className="bg-gray-50">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="bg-gradient-to-tr from-green-600 via-green-700 to-green-900 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-10 md:p-16 text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                  Digital Garbage Management
                </h1>
                <p className="text-green-100 max-w-xl mb-8">
                  Innovative tools to monitor, collect and optimize waste
                  operations — making cities cleaner and more efficient.
                </p>
                <div className="flex items-center gap-4">
                  <button className="inline-flex items-center gap-3 bg-white text-green-800 hover:bg-green-50 px-5 py-3 rounded-full font-semibold shadow-sm">
                    Learn More
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-3 border border-white/30 text-white px-4 py-3 rounded-full font-medium hover:bg-white/5"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              <div className="p-6 md:p-10 flex justify-center">
                <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1681488048176-1cd684f6be8a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Garbage Management"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About / Stats */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-green-700 uppercase font-semibold tracking-wide">
                About Waste Management
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
                Leaders in innovative waste management solutions
              </h2>
              <p className="text-gray-600 mb-6">
                We combine technology and responsible practices to minimize
                environmental impact while improving collection efficiency and
                community health.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    src: waste,
                    title: "Waste Solutions",
                  },
                  {
                    src: global,
                    title: "Global Expertise",
                  },
                  {
                    src: commercial,
                    title: "Commercial Use",
                  },
                  {
                    src: residential,
                    title: "Residential Use",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white shadow-sm rounded-lg p-4 text-center"
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="mx-auto mb-3 w-12 h-12"
                    />
                    <h4 className="font-medium text-green-800">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-md px-8 py-10 flex flex-col items-center justify-center text-center border border-green-100">
              <p className="text-gray-700 font-semibold mb-3 uppercase tracking-wide">
                Pounds of waste diverted
              </p>
              <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-green-800 leading-tight">
                412,000+
              </div>
              <p className="text-sm md:text-base text-gray-500 mt-4 max-w-xs">
                Measured across partner cities in the last 12 months.
              </p>
            </div>
          </div>
        </section>

        {/* WASTE MANAGEMENT SERVICES */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="mb-8 text-center">
            <h3 className="text-green-700 uppercase font-semibold tracking-wide">
              WASTE MANAGEMENT SERVICES
            </h3>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Smart Solutions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3">
              Our comprehensive waste management solutions are designed to make
              waste collection and processing more efficient, environmentally
              friendly, and cost-effective for communities.
            </p>
            <div className="mt-4">
              <button className="bg-green-700 text-white px-5 py-2 rounded-full font-semibold">
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Waste Solutions */}
            <article className="bg-white rounded-xl shadow p-6 flex flex-col">
              <img
                src="https://automaxsw.com/wp-content/uploads/2022/07/Automax-IoT-Smart-Waste-Management-using-AutoMax-IoT-enabled-Solutions_v2-scaled.jpg"
                alt="Smart waste bin"
                className="w-full h-44 object-cover rounded-md mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">
                Smart Waste Solutions
              </h4>
              <p className="text-gray-600 flex-1">
                Track waste collection using smart devices attached to your
                bins. Real-time monitoring and data analytics for efficient
                waste management.
              </p>
              <a
                className="mt-4 inline-block text-green-700 font-medium"
                href="#"
              >
                Learn More →
              </a>
            </article>

            {/* Area-based Pricing */}
            <article className="bg-white rounded-xl shadow p-6 flex flex-col">
              <img
                src="https://www.chgreen.my/wp-content/uploads/2020/09/title-bg-dark.jpg"
                alt="Digital map pricing zones"
                className="w-full h-44 object-cover rounded-md mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">Area-based Pricing</h4>
              <p className="text-gray-600 flex-1">
                Customized pricing models based on location, waste volume, and
                collection frequency. Fair and transparent billing system.
              </p>
              <a
                className="mt-4 inline-block text-green-700 font-medium"
                href="#"
              >
                Learn More →
              </a>
            </article>

            {/* Authority Registration */}
            <article className="bg-white rounded-xl shadow p-6 flex flex-col">
              <img
                src="https://www.keyfactor.com/wp-content/uploads/iStock-1146311489-scaled.jpg"
                alt="Registration portal"
                className="w-full h-44 object-cover rounded-md mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">
                Authority Registration
              </h4>
              <p className="text-gray-600 flex-1">
                Streamlined process for waste management authority
                registrations. Ensure compliance with local regulations and
                standards.
              </p>
              <a
                className="mt-4 inline-block text-green-700 font-medium"
                href="#"
              >
                Learn More →
              </a>
            </article>

            {/* Vehicle Tracking */}
            <article className="bg-white rounded-xl shadow p-6 flex flex-col">
              <img
                src="https://qodenext.com/wp-content/uploads/2023/05/vechile-compressed.jpg"
                alt="Vehicle tracking"
                className="w-full h-44 object-cover rounded-md mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">Vehicle Tracking</h4>
              <p className="text-gray-600 flex-1">
                Real-time GPS tracking of garbage collection vehicles. Optimize
                routes and monitor collection schedules efficiently.
              </p>
              <a
                className="mt-4 inline-block text-green-700 font-medium"
                href="#"
              >
                Learn More →
              </a>
            </article>

            {/* Smart Solutions (overview card) */}
            <article className="bg-white rounded-xl shadow p-6 flex flex-col">
              <img
                src="https://waste2resources.com.au/wp-content/uploads/2025/08/2151951193.jpg"
                alt="Smart solutions overview"
                className="w-full h-44 object-cover rounded-md mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">Smart Solutions</h4>
              <p className="text-gray-600 flex-1">
                Smart waste bin with digital display and integrated analytics to
                support proactive collection and maintenance.
              </p>
              <a
                className="mt-4 inline-block text-green-700 font-medium"
                href="#"
              >
                Learn More →
              </a>
            </article>
          </div>
        </section>

        {/* Testimonials / Stats Component (kept but smaller) */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <WasteManagementStats />
        </section>

        {/* Large Contact Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-green-800 text-xl font-semibold">
                We'd love to hear from you.
              </h3>
              <p className="mt-4 text-gray-700">
                Whether you have a question about features, pricing, need a
                demo, or anything else, our team is ready to answer all your
                questions.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Call us directly
                  </h4>
                  <a
                    href="tel:+94741878626"
                    className="text-green-800 font-semibold text-lg"
                  >
                    +94 741 878 626
                  </a>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Privacy</h4>
                  <p className="text-sm text-gray-500">
                    We will never collect information about you without your
                    explicit consent.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
              <h3 className="text-lg font-semibold mb-4">Submit request</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Request submitted — we will contact you soon.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ENTER YOUR NAME*
                  </label>
                  <input
                    required
                    name="name"
                    placeholder="What's your good name?"
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PHONE NUMBER
                  </label>
                  <input
                    name="phone"
                    placeholder="Enter your phone number"
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EMAIL ADDRESS*
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SUBJECT
                  </label>
                  <input
                    name="subject"
                    placeholder="How can we help you?"
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    YOUR MESSAGE
                  </label>
                  <textarea
                    name="message"
                    placeholder="Describe about your project"
                    rows={5}
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-sm font-medium mr-4"
                  >
                    Submit request
                  </button>
                  <p className="text-sm text-gray-500">
                    We will never collect information about you without your
                    explicit consent.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
