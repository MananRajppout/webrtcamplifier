import Button from "@/components/shared/button";
import React, { useState } from "react";

const Step4 = ({ formData, updateFormData, uniqueId }) => {
  const [credits, setCredits] = useState(Array(5).fill(0));
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const packages = [
    { hours: 1, rate: 150, description: "1 Hour: $150.00" },
    { hours: 25, rate: 3500, description: "25 Hours: $3,500.00" },
    { hours: 100, rate: 13500, description: "100 Hours: $13,500.00" },
    { hours: 250, rate: 32500, description: "250 Hours: $32,500.00" },
    { hours: 500, rate: 60000, description: "500 Hours: $60,000.00" },
  ];

  const handleCreditChange = (index, quantity) => {
    const updatedCredits = [...credits];
    updatedCredits[index] = parseInt(quantity, 10) || 0;
    setCredits(updatedCredits);

    let newTotalHours = 0;
    let newTotalPrice = 0;

    updatedCredits.forEach((qty, i) => {
      newTotalHours += qty * packages[i].hours;
      newTotalPrice += qty * packages[i].rate;
    });

    setTotalHours(newTotalHours);
    setTotalPrice(newTotalPrice);
  };

  const handleBuyNow = () => {
    // Mock payment flow
    alert("Redirecting to payment page...");
    setTimeout(() => {
      alert("Payment successful!");
      setPaymentComplete(true);
    }, 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project Review</h2>

      {/* Respondent Market and Language */}
      <div className="mb-4">
        <p className="text-sm font-medium">
          <strong>Respondent Market:</strong>{" "}
          {formData.market == "us" ? "USA" : formData.otherMarket}
        </p>
        <p className="text-sm font-medium">
          <strong>Respondent Language:</strong> {formData.language || "N/A"}
        </p>
      </div>

      {/* Project Estimate Table */}
      <h3 className="text-xl font-bold mt-6 mb-4">Project Estimate:</h3>
<table className="w-full border-collapse border border-gray-300 text-sm">
  <thead>
    <tr>
      <th className="border border-gray-300 p-2">Service</th>
      <th className="border border-gray-300 p-2">Quantity</th>
      <th className="border border-gray-300 p-2">Session Duration (mins)</th>
      <th className="border border-gray-300 p-2">Total Hour</th>
      <th className="border border-gray-300 p-2">Unit Price</th>
      <th className="border border-gray-300 p-2">Total Price USD</th>
    </tr>
  </thead>
  <tbody>
    {formData.sessions?.map((session, index) => {
      // Extract duration in minutes
      const durationString = session.duration || "0 minutes";

      // Check for both formats: "30 minutes" or "1.25 hour (75 minutes)"
      let durationMinutes = 0;
      const matchMinutes = durationString.match(/(\d+)\s*minutes/); // For "30 minutes"
      const matchParentheses = durationString.match(/\((\d+)\s*minutes\)/); // For "(75 minutes)"

      if (matchMinutes) {
        durationMinutes = parseInt(matchMinutes[1], 10); // Extract minutes
      } else if (matchParentheses) {
        durationMinutes = parseInt(matchParentheses[1], 10); // Extract minutes in parentheses
      }

      const durationHours = durationMinutes / 60; // Convert to hours
      const quantity = parseInt(session.number || 0, 10); // Get quantity
      const totalHours = durationHours * quantity; // Calculate total hours
      const unitPrice = 150; // Unit price per hour
      const totalPrice = totalHours * unitPrice; // Calculate total price

      return (
        <tr key={index}>
          <td className="border border-gray-300 p-2">Signature Service</td>
          <td className="border border-gray-300 p-2">{quantity || 0}</td>
          <td className="border border-gray-300 p-2">{session.duration || "N/A"}</td>
          <td className="border border-gray-300 p-2">{totalHours.toFixed(2)} hrs</td>
          <td className="border border-gray-300 p-2">${unitPrice}</td>
          <td className="border border-gray-300 p-2">${totalPrice.toFixed(2)}</td>
        </tr>
      );
    })}
  </tbody>
  <tfoot>
    <tr className="font-bold">
      <td colSpan="5" className="border border-gray-300 p-2 text-right">
        Estimated Total:
      </td>
      <td className="border border-gray-300 p-2">
        $
        {formData.sessions
          ?.reduce((total, session) => {
            const durationString = session.duration || "0 minutes";
            let durationMinutes = 0;
            const matchMinutes = durationString.match(/(\d+)\s*minutes/);
            const matchParentheses = durationString.match(/\((\d+)\s*minutes\)/);

            if (matchMinutes) {
              durationMinutes = parseInt(matchMinutes[1], 10);
            } else if (matchParentheses) {
              durationMinutes = parseInt(matchParentheses[1], 10);
            }

            const durationHours = durationMinutes / 60;
            const quantity = parseInt(session.number || 0, 10);
            return total + durationHours * quantity * 150;
          }, 0)
          .toFixed(2)}
      </td>
    </tr>
  </tfoot>
</table>
<p className="text-sm text-gray-500 mt-2">
  *Final billing will be based on actual streaming hours for sessions booked.
</p>



      {/* Purchase Credits */}
      <h3 className="text-xl font-bold mt-6 mb-4">Purchase Credits:</h3>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Qty</th>
            <th className="border border-gray-300 p-2">Package</th>
            <th className="border border-gray-300 p-2">Total Hours</th>
            <th className="border border-gray-300 p-2">Total Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">
                <select
                  onChange={(e) => handleCreditChange(index, e.target.value)}
                  className="border p-1 rounded w-full"
                  defaultValue="0"
                >
                  <option value="0">0</option>
                  {[...Array(8).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-gray-300 p-2">{pkg.description}</td>
              <td className="border border-gray-300 p-2">
                {credits[index] * pkg.hours}
              </td>
              <td className="border border-gray-300 p-2">
                ${(credits[index] * pkg.rate).toFixed(2)}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="font-bold">
            <td className="border border-gray-300 p-2">Total</td>
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2">{totalHours}</td>
            <td className="border border-gray-300 p-2">
              ${totalPrice.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Terms & Conditions */}
      <h3 className="text-xl font-bold mt-6 mb-4">Terms & Conditions:</h3>
      <p className="text-sm text-gray-600">
        Any leftover credits will show in your account after your project is
        completed. Streaming hours used that are not pre-paid (overage time,
        add-on interviews without purchasing credit) will be billed at $165 per
        hour for Signature Service or $275 for Concierge Service, charged to
        your credit card on file the day they are used. You may add credits to
        your account at any time. Time utilization is billed based on streaming
        hours and will be charged in 15-minute increments.
      </p>

      {/* Buy Now or Save/Submit */}
      <div className="mt-6 flex justify-end">
        {!paymentComplete ? (
          <Button
            onClick={handleBuyNow}
            className=" py-2 px-4 rounded-lg"
            variant="secondary"
          >
            Buy Now
          </Button>
        ) : (
          <Button
            onClick={() => alert("Form submitted successfully!")}
            className=" py-2 px-4 rounded-lg"
            variant="secondary"
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default Step4;
