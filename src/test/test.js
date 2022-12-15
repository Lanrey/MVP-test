require("dotenv").config();
process.env.PORT = 7777;
process.env.DB_CONN = `${process.env.DB_CONN}_test`;
const logger = require("../helpers/logger");
const { faker } = require("@faker-js/faker");

const mongoose = require("mongoose");
let app = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;
const { User, Product } = require("../models");
const moment = require("moment");

chai.use(chaiHttp);

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

//Our parent block
describe("Tests", async () => {
  beforeEach((done) => {
    //Before each test we empty the database
    // connectDB();
    // clearDB();
    done();
  });

  describe("/POST Successfully Initiate a Deposit", () => {
    it("Successfully deposit money into a buyer account", async (done) => {
      const buyerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "buyer",
      };
      const buyer = await User.create(buyerData);
      const payload = {
        user: buyer,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .post("/api/v1/user/deposit")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 100 })
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Unsucessfully Initiate a Deposit", () => {
    it("Unsucessfully deposit money into a buyer account", async (done) => {
      const buyerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "buyer",
      };
      const buyer = await User.create(buyerData);

      chai
        .request(app)
        .post("/api/v1/user/deposit")
        .send({ amount: 100 })
        .end((err, res) => {
          res.should.have.status(401);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Purchase a Product", () => {
    it("Successfully purchase a product", async (done) => {
      const buyerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "buyer",
        deposit: 100,
      };
      const buyer = await User.create(buyerData);

      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 20,
        amountAvailable: 100,
        sellerId: seller._id,
      };

      const product = await Product.create(productData);
      const payload = {
        user: buyer,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .post("/api/v1/product/buy")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id, amountOfProducts: 3 })
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Unsucessfully Purchase a Product", () => {
    it("Unsucessfully purchase a product due to insufficient funds", async (done) => {
      const buyerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "buyer",
        deposit: 50,
      };
      const buyer = await User.create(buyerData);

      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()} ${faker.lorem.word()}`,
        cost: 20,
        amountAvailable: 100,
        sellerId: seller._id,
      };

      const product = await Product.create(productData);
      const payload = {
        user: buyer,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .post("/api/v1/product/buy")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id, amountOfProducts: 3 })
        .end((err, res) => {
          res.should.have.status(400);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Create a Product", () => {
    it("Successfully create a product", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 50,
        amountAvailable: 50,
      };

      const payload = {
        user: seller,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .post("/api/v1/product")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...productData })
        .end((err, res) => {
          res.should.have.status(201);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Get a Product", () => {
    it("Successfully get a product", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 50,
        amountAvailable: 50,
        sellerId: seller._id,
      };

      const product = await Product.create(productData);
      chai
        .request(app)
        .get(`/api/v1/product/${product._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Get all Products", () => {
    it("Successfully get all products", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= 5; i++) {
        const product = {
          productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
          cost: faker.helpers.arrayElement([5, 10, 15, 20, 25]),
          amountAvailable: faker.random.numeric(2),
          sellerId: seller._id,
        };

        productData.push(product);
      }

      const product = await Product.create(productData);
      chai
        .request(app)
        .get(`/api/v1/product/all`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Update a Product", () => {
    it("Successfully update a product", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 50,
        amountAvailable: 50,
        sellerId: seller._id,
      };

      const product = await Product.create(productData);

      const payload = {
        user: seller,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .put(`/api/v1/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ cost: 100 })
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Unsuccessfully Update a Product", () => {
    it("Unsuccessfully update a product because of invalid amount", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };

      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 50,
        amountAvailable: 50,
        sellerId: "6399f22ad2eee6495ca21bc7",
      };

      const product = await Product.create(productData);

      const payload = {
        user: seller,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .put(`/api/v1/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ cost: 23 })
        .end((err, res) => {
          res.should.have.status(400);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });

  describe("/POST Successfully Delete a Product", () => {
    it("Successfully delete a product", async (done) => {
      const sellerData = {
        userName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        password: faker.lorem.word(),
        role: "seller",
      };
      const seller = await User.create(sellerData);

      const productData = {
        productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
        cost: 50,
        amountAvailable: 50,
        sellerId: seller._id,
      };

      const product = await Product.create(productData);

      const payload = {
        user: seller,
        iat: moment().unix(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      chai
        .request(app)
        .delete(`/api/v1/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.isDefined(res.body.data);
          assert.isDefined(res.body.message);
          done();
        });
    });
  });
});
