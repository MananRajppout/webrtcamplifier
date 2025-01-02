const controller = require("../controllers/paymentController");

module.exports = function (app) {
  app.post("/api/create-payment-intent", controller.createPaymentIntent);
  app.post("/api/save-payment", controller.savePayment)
  app.post("/api/update-payment", controller.updatePaymentProjectId )
 
};
