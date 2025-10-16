import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../api/userApi";
import { getAllAreas } from "../../api/areaApi";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import WMARegister from "../wma/auth/WMARegister";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUser, setIsUser] = useState(true);
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const navigate = useNavigate();

  // State for user input
  const [userEntryData, setUserEntryData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    contact: "",
    area: "",
    confirmPassword: "",
  });

  const { username, email, password, address, contact, area, confirmPassword } =
    userEntryData;
  const [areas, setAreas] = useState([]); // State to store areas fetched from the API
  const [areaId, setAreaId] = useState(null); // State for storing selected area ID

  const fetchAllAreas = async () => {
    try {
      const res = await getAllAreas(); // Use the named export
      setAreas(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching Areas: ", error.message);
    }
  };
  useEffect(() => {
    fetchAllAreas();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setUserEntryData({
      ...userEntryData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    // Upload image and handle registration
    try {
      const uploadedImageUrl = await uploadImage();
      setUploadImageUrl(uploadedImageUrl);

      // Assuming 'area' is now an ID/reference (e.g., from a dropdown or selection)
      const newUserEntry = {
        username,
        email,
        password,
        address,
        contact,
        area: areaId, // Make sure 'areaId' is the correct reference ID for the area
        profileImage: uploadedImageUrl,
      };

      console.log("Sending new user data:", newUserEntry);
      await AuthService.register(newUserEntry);

      toast.success("Your account has been created successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      navigate("/login");
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload to Cloudinary
  const uploadImage = async () => {
    if (!imageSelected) return null;

    const data = new FormData();
    data.append("file", imageSelected);
    data.append("upload_preset", "GarboGoUser_Preset");
    data.append("cloud_name", "dg8cpnx1m");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dg8cpnx1m/image/upload",
        {
          method: "POST",
          body: data,
        },
      );

      const imageUrl = await res.json();
      return imageUrl.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };
  useEffect(() => {
    setIsUser(true); // This will trigger a re-render every time
  }, []);

  return (
    <div>
      <section className="bg-[#f5fadf] :bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 :text-white"
          >
            <img className="w-44 mr-2" src={logo} alt="logo" />
          </a>
          <div className=" bg-white rounded-lg shadow :border w-[70%]">
            <div className="p-6 ">
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
                  <h1 className="my-4 text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl :text-white">
                    Create an User Account
                  </h1>
                  <form
                    className="space-y-4 md:space-y-6 "
                    onSubmit={handleSubmit}
                  >
                    <div className="flex">
                      <div className="w-[50%] mx-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Your Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            placeholder="name@gmail.com"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="username"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Your Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            placeholder="Enter Username"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="address"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Your Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={address}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            placeholder="Enter Address"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="area"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Your Area
                          </label>
                          <select
                            name="area"
                            id="area"
                            value={areaId} // use areaId instead of area
                            onChange={(e) => setAreaId(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            required
                          >
                            <option value="">Select Your Area</option>
                            {areas && areas.length > 0 ? (
                              areas.map((areaItem) => (
                                <option key={areaItem._id} value={areaItem._id}>
                                  {" "}
                                  {/* Use area ID here */}
                                  {areaItem.name}
                                </option>
                              ))
                            ) : (
                              <option>No areas available</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="w-[50%] mx-4">
                        <div>
                          <label
                            htmlFor="contact"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Your Contact
                          </label>
                          <input
                            type="tel"
                            name="contact"
                            id="contact"
                            value={contact}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            placeholder="Enter Contact Number"
                            pattern="[0-9]{10}"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="profileImage"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Add Profile Image
                          </label>
                          <input
                            type="file"
                            name="profileImage"
                            id="profileImage"
                            onChange={(e) =>
                              setImageSelected(e.target.files[0])
                            }
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            accept="image/*"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="password"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block my-2 text-sm font-medium text-gray-900 :text-white"
                          >
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                            required
                          />
                        </div>
                        {errorMessage && (
                          <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <p className="mx-4 text-sm font-light text-gray-500 :text-gray-400">
                        Already have an account?{" "}
                        <a
                          href="/login"
                          className="font-medium text-[#64903c] hover:underline :text-blue-500"
                        >
                          Login here
                        </a>
                      </p>
                      <button
                        type="submit"
                        className="w-auto text-white  bg-[#64903c] hover:bg-[#4d702c] focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Create Account"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {!isUser && (
                <div>
                  <h1 className="my-4 text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl :text-white">
                    Create a Waste Management Authority Account
                  </h1>
                  <WMARegister />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
