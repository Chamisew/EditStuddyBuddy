import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";

const Navbar = () => {
  return (
    <>
      <nav className="rounded-b-xl border-gray-200 :bg-gray-900 sticky top-0 backdrop-blur-lg z-50">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href={"#"}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src={logo} className="h-8" alt="Flowbite Logo" />
          </a>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 :text-gray-400 :hover:bg-gray-700 :focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex items-center flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg- :bg-gray-800 md::bg-gray-900 :border-gray-700">
              {/* <li>
                <a
                  href="#"
                  className="block py-2 px-3 text-white bg-green-700 rounded md:bg-transparent md:text-green-700 md:p-0 :text-white md::text-green-500"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 :text-white md::hover:text-green-500 :hover:bg-gray-700 :hover:text-white md::hover:bg-transparent"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 :text-white md::hover:text-green-500 :hover:bg-gray-700 :hover:text-white md::hover:bg-transparent"
                >
                  Contact
                </a>
              </li> */}
              <div className="flex gap-3 ">
                <li>
                  <Link to={"/login"}>
                    <button className="bg-white text-green-600 px-4 py-2 rounded-lg border-2 border-green-600 ">
                      Sign In
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to={"/register"}>
                    <button className="text-white bg-green-600 px-4 py-2 rounded-lg ">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
