const controller = require("../controllers/contactController");

module.exports = function (app) {
  app.post("/api/create/contact", controller.createContact);
  app.get("/api/create/contact-from-member-tab/:userId/:projectId", controller.createContactForMemberTab);
  app.get("/api/get/contact-id", controller.getContactById);
  app.get("/api/get-all/contact", controller.getAllContacts);
  app.get("/api/get-all/contact/:id", controller.getContactsByUserId);
  app.put("/api/update-contact/:id", controller.updateContact);
  app.delete("/api/delete/contact/:id", controller.deleteContact);
  // New search API for contacts by first name
  app.get("/api/search/contact", controller.searchContactsByFirstName);
  app.get("/api/contacts/get-companies", controller.getUniqueCompanies);
};

// for usage of this search Api
// GET /api/search/contact?firstName=John
