import { useState } from "react";
import WmaAuthService from "../../../api/wmaApi";
import { Link, useNavigate } from "react-router-dom";

const WMALogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await WmaAuthService.wmaLogin({ email, password });
      console.log("Login successful", response);
      navigate("/wma/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div>
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
  );
};

export default WMALogin;
