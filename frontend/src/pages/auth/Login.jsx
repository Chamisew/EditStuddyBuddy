import { useState } from "react";
import AuthService from "../../api/userApi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import WMALogin from "../wma/auth/WMALogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await AuthService.login({ email, password });
      console.log("Login successful", response);
      // Redirect to dashboard or home page
      if (response.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section className="bg-[#f5fadf] :bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 :text-white"
        >
          <img className="w-44 mr-2" src={logo} alt="logo" />
        </a>
        <div className="w-full bg-white rounded-lg shadow :border md:mt-0 sm:max-w-md xl:p-0 :bg-gray-800 :border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex justify-center  border-b mx-6">
              <div className="flex w-[50%] justify-between font-bold my-2 text-gray-500">
                <h1
                  className={`cursor-pointer ${
                    isUser ? "text-[#64903c]" : "text-black"
                  }`}
                  onClick={() => setIsUser(true)}
                >
                  User
                </h1>
                <h1
                  className={`cursor-pointer ${
                    !isUser ? "text-[#64903c]" : "text-black"
                  }`}
                  onClick={() => setIsUser(false)}
                >
                  WMA
                </h1>
              </div>
            </div>
            {isUser && (
              <div>
                <h1 className="mb-5 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl :text-white">
                  Sign in to User Account
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900 :text-white"
                    >
                      Your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 :bg-gray-700 :border-gray-600 :placeholder-gray-400 :text-white :focus:ring-blue-500 :focus:border-blue-500"
                      placeholder="name@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900 :text-white"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 :bg-gray-700 :border-gray-600 :placeholder-gray-400 :text-white :focus:ring-blue-500 :focus:border-blue-500"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white bg-[#527436] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center :bg-primary-600 :hover:bg-primary-700 :focus:ring-primary-800"
                  >
                    Sign in
                  </button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <p className="text-sm font-light text-gray-500 :text-gray-400">
                    Don't have an account yet?{" "}
                    <Link
                      to={"/register"}
                      className="font-medium text-primary-600 hover:underline :text-primary-500"
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            )}
            {!isUser && (
              <div>
                <h1 className="mb-5 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl :text-white">
                  Sign in to WMA Account
                </h1>
                <WMALogin />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
