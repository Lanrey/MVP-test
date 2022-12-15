const mongoose = require("mongoose");
const logger = require("../helpers/logger");
require("dotenv").config();
const { User, Product } = require("../models");
const { getUserData } = require("./mock/user.mock");
const { getProductData } = require("./mock/product.mock");

const connectDB = async () => {
  logger.info("connecting to db");

  await mongoose.connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};

const clearDB = async () => {
  logger.warn("clearing db");
  await Promise.all(
    Object.values(mongoose.connection.collections).map(async (collection) =>
      collection.deleteMany()
    )
  );
};

const disconnectDB = async () => {
  logger.warn("disconnecting from db");
  await mongoose.disconnect();
};

const seedDB = async () => {
  try {
    logger.info("Seeding Database");
    await connectDB();
    await clearDB();

    logger.info("Creating Sellers");
    const fakeSellers = await User.create(await getUserData("seller"));

    logger.info("Creating Buyers");
    const fakeBuyers = await User.create(await getUserData("buyers"));

    logger.info("Creating Random Products");
    await Product.create(await getProductData(fakeSellers));

    logger.info("seeder completed");
  } catch (e) {
    logger.error(e);
  }

  await disconnectDB();
};

seedDB();
