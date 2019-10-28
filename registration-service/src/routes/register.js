const express = require('express');

const { produce, REGISTRATION_CONFIRMED } = require('../kafka');

const router = express.Router();
const users = [];

router.post('/', async (req, res) => {
  const { correlation } = req.query;
  users.push(req.body);
  await produce(REGISTRATION_CONFIRMED, req.body, correlation);
  res.status(201).send();
});

module.exports = router;
