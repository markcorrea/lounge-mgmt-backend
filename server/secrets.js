const dotenv = require('dotenv').config();

console.log(process.env.DATABASE);

const secrets = {
  dbUri: process.env.DATABASE,
};

const getSecret = (key) => secrets[key];

module.exports = { getSecret };
