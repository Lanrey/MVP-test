// eslint-disable-next-line import/no-extraneous-dependencies
const { faker } = require("@faker-js/faker");

const getProductData = async (sellers) => {
  const productData = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= 500; i++) {
    const product = {
      productName: `${faker.lorem.word()}-${faker.random.numeric(5)}`,
      cost: faker.helpers.arrayElement([5, 10, 15, 20, 25]),
      amountAvailable: faker.random.numeric(3),
      sellerId: faker.helpers.arrayElement([...sellers]),
    };

    productData.push(product);
  }

  return productData;
};

module.exports = {
  getProductData,
};
