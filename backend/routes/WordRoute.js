const express = require('express');
const router = express.Router();
const wordController = require('../controllers/WordController');

router.post('/addWord', wordController.addWord);
router.get('/getAllWords', wordController.getAllWords);
router.get('/getWordsByType/:type', wordController.getWordsByType);
router.get('/getWordById/:id', wordController.getWordById);
router.put('/updateWord/:id', wordController.updateWord);
router.delete('/deleteWord/:id', wordController.deleteWord);

module.exports = router;
