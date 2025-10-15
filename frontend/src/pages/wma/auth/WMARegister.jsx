import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WmaAuthService from "../../../api/wmaApi";
import { toast } from "react-toastify";

const WMARegister = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const navigate = useNavigate();

  // State for user input
  const [userEntryData, setUserEntryData] = useState({
    wmaname: "",
    email: "",
    password: "",
    address: "",
    contact: "",
    authNumber: "",
    confirmPassword: "",
  });

  const {
    wmaname,
    email,
    password,
    address,
    contact,
    authNumber,
    confirmPassword,
  } = userEntryData;

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

      const newUserEntry = {
        wmaname,
        email,
        password,
        address,
        contact,
        authNumber,
        profileImage: uploadedImageUrl,
      };

      console.log("Sending new user data:", newUserEntry);
      await WmaAuthService.wmaRegister(newUserEntry);

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

  return (
    <div>
      <form className="space-y-4 md:space-y-6 " onSubmit={handleSubmit}>
        <div className="flex">
          <div className="w-[50%] mx-4">
            <div>
              <label
                htmlFor="email"
                className="block my-2 text-sm font-medium text-gray-900 :text-white"
              >
                Company Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="wmaname"
                className="block my-2 text-sm font-medium text-gray-900 :text-white"
              >
                Company Name
              </label>
              <input
                type="text"
                name="wmaname"
                id="wmaname"
                value={wmaname}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                placeholder="Enter WMA name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block my-2 text-sm font-medium text-gray-900 :text-white"
              >
                Company Address
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
                htmlFor="authnumber"
                className="block my-2 text-sm font-medium text-gray-900 :text-white"
              >
                Company Authorization Number
              </label>
              <input
                type="text"
                name="authNumber"
                id="authNumber"
                value={authNumber}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                placeholder="Enter Company Authorization Number"
                required
              />
            </div>
          </div>
          <div className="w-[50%] mx-4">
            <div>
              <label
                htmlFor="contact"
                className="block my-2 text-sm font-medium text-gray-900 :text-white"
              >
                Company Contact Number
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
                Add Company Logo
              </label>
              <input
                type="file"
                name="profileImage"
                id="profileImage"
                onChange={(e) => setImageSelected(e.target.files[0])}
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
  );
};

export default WMARegister;
