const express = require('express');
const { listDocuments } = require('../controllers/docsController');

const router = express.Router();

router.get('/', listDocuments);

module.exports = router;
