import { Phone, Mail, MessageSquare, User, Send } from "lucide-react";

const ContactForm = () => {
  return (
    <div className="px-40 mx-auto p-20 py-32">
      <div className="space-y- flex justify-between">
        <div className="space-y-4 w-[25%]">
          <h1 className="text-4xl font-semibold text-gray-900">
            We'd love to hear from you.
          </h1>
          <p className="text-gray-500">
            Whether you have a question about features, pricing, need a demo, or
            anything else, our team is ready to answer all your questions.
          </p>
        </div>
        {/* Form */}
        <form className="space-y-6 w-[65%]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                ENTER YOUR NAME*
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="What's your good name?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                PHONE NUMBER
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                EMAIL ADDRESS*
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                SUBJECT
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <MessageSquare className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              YOUR MESSAGE
            </label>
            <textarea
              placeholder="Describe about your project"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-between items-center">
            {/* Contact Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Call us directly</p>
                <p className="text-gray-500">+94 741 878 626</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white rounded-full flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <Send className="h-5 w-5" />
              <span>Submit request</span>
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="text-sm text-gray-500">
            We will never collect information about you without your explicit
            consent.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
