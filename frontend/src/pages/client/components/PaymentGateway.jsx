import { useState } from "react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CloseIcon from "@mui/icons-material/Close";
import PaidIcon from "@mui/icons-material/Paid";

const PaymentGateway = ({ onSubmitPayment, onClose }) => {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState({});

  const validateCardNumber = (number) => {
    const regex = /^\d{16}$/; // Card number must be 16 digits
    return regex.test(number);
  };

  const validateExpiry = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/; // Format MM/YY
    if (!regex.test(date)) return false;

    const [month, year] = date.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Last 2 digits of the current year
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
      return true;
    }
    return false;
  };

  const validateCVC = (code) => {
    const regex = /^\d{3}$/; // CVC must be exactly 3 digits
    return regex.test(code);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = "Card number must be exactly 16 digits.";
    }

    if (!validateExpiry(expiry)) {
      newErrors.expiry =
        "Expiry date must be in MM/YY format and be in the future.";
    }

    if (!validateCVC(cvc)) {
      newErrors.cvc = "CVC must be exactly 3 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const paymentData = { name, cardNumber, expiry, cvc };
    onSubmitPayment(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between mb-7">
          <div className="flex flex-col items-start gap-2">
            <CreditCardIcon
              fontSize="large"
              className="bg-green-200 p-2 rounded-lg text-green-600"
            />
            <h2 className="text-xl font-semibold text-gray-800 text-left">
              Payment Details
            </h2>
          </div>
          <div onClick={onClose} className="cursor-pointer">
            <CloseIcon />
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm mb-1 font-medium">
              Name on Card
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm mb-1 font-medium">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 16) {
                  setCardNumber(value);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition ${
                errors.cardNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="1234 5678 9012 3456"
              required
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-2">{errors.cardNumber}</p>
            )}
          </div>
          <div className="flex space-x-4 mb-5">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm mb-1 font-medium">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + "/" + value.slice(2);
                  }
                  if (value.length <= 5) {
                    setExpiry(value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition ${
                  errors.expiry ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="MM/YY"
                required
              />
              {errors.expiry && (
                <p className="text-red-500 text-xs mt-2">{errors.expiry}</p>
              )}
            </div>

            <div className="w-1/2">
              <label className="block text-gray-600 text-sm mb-1 font-medium">
                CVC
              </label>
              <input
                type="number"
                value={cvc}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 3) {
                    setCvc(value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition ${
                  errors.cvc ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="123"
                required
              />
              {errors.cvc && (
                <p className="text-red-500 text-xs mt-2">{errors.cvc}</p>
              )}
            </div>
          </div>
          <div className="mb-5">
            <div className="flex items-center">
              <input type="checkbox" id="agree" className="mr-2" required />
              <label htmlFor="agree" className="text-gray-600 text-sm">
                I agree to the terms and conditions of the card payment.
              </label>
            </div>
          </div>
          <div className="flex w-full justify-center items-center mt-6">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold w-[100%] p-2 rounded-md transition"
            >
              Submit Payment
            </button>
          </div>
        </form>
        <p className="mt-6 flex justify-center font-light text-sm text-gray-400">
          powered by&nbsp;
          <div className="flex items-center gap-1 cursor-pointer">
            <PaidIcon fontSize="small" className="text-gray-500" />
            <span className="underline text-gray-700 font-bold">
              CleanPathPay
            </span>
          </div>
        </p>
      </div>
    </div>
  );
};

export default PaymentGateway;
