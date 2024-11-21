const controller = require("../controllers/userController");
const upload = require("../../middleware/upload");
const parseDates = (req, res, next) => {
  const { startDate, endDate } = req.query;
  req.startDate = new Date(startDate);
  req.endDate = new Date(endDate);
  next();
};

module.exports = function (app) {
  app.post("/api/users/create", controller.signup);
  app.post(
    "/api/users/upload-users",
    upload.single("file"),
    controller.uploadUserExcel
  );
  app.post("/api/users/signin", controller.signin);
  app.put(
    "/api/users/update",
    upload.single("profilePhoto"),
    controller.update
  );
  app.get("/api/users/find-by-id", controller.findById);
  app.delete("/api/users/delete-by-id", controller.deleteById);
  app.get("/api/users/find-all", controller.findAll);
  app.get(
    "/api/users/bulk-report-users",
    parseDates,
    controller.downloadUserExcel
  );
  app.get("/api/get-users", controller.findAll);
  app.post("/api/users/reset-password", controller.resetPassword);
  app.post("/api/users/forgot-password", controller.forgotPassword);
  app.get("/api/verify", controller.verifymail);
  app.post("/api/users/changePassword", controller.changePassword);
  app.post("/api/users/create-by-admin", controller.userCreateByAdmin)
};
