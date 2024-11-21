const companyController = require("../controllers/companyController");

module.exports = function (app) {
  app.post("/api/create-company", companyController.createCompany);
  app.put("/api/update-company/:id", companyController.updateCompany);
  app.delete("/api/delete-company/:id", companyController.deleteCompany);
  app.get("/api/get-company/:id", companyController.getCompany);
  app.get("/api/get-all-companies", companyController.getAllCompanies);
};
