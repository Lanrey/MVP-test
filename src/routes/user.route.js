const express = require("express");
const validate = require("../helpers/validate");

const { userController } = require("../controllers");
const { userValidation, authValidation } = require("../policies");

const router = express.Router();

router.post(
  "/deposit",
  [
    authValidation.validateToken,
    authValidation.isBuyer,
    validate(userValidation.deposit),
  ],
  userController.userDeposit
);

router.post(
  "/reset",
  [authValidation.validateToken, authValidation.isBuyer],
  userController.userReset
);

router.post(
  "/logout",
  [authValidation.validateToken],
  userController.userLogout
);

router.post("/login", [validate(userValidation.login)], userController.login);

router.get("/:_id", [validate(userValidation.get)], userController.listOne);

router.post("/", [validate(userValidation.create)], userController.createUser);

router.put("/", [authValidation.validateToken], userController.editUser);

router.delete("/", [authValidation.validateToken], userController.deleteUser);

router.get("/", userController.list);

module.exports = router;
