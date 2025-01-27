const controller = require("../controllers/paymentController");

module.exports = function (app) {
  app.post("/api/create-payment-intent", controller.createPaymentIntent);
  app.post("/api/save-payment", controller.savePayment)
  app.post("/api/update-payment", controller.updatePaymentProjectId )
  app.get("/api/get-user-payment-data/:id", controller.getPaymentDataByUserId)
  app.post("/api/create-stripe-customer", controller.createStripeCustomer);
  app.post("/api/update-credit-card", controller.updateCreditCard);
 
};
