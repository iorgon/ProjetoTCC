const express = require('express');
const router = express.Router();
const clientDocumentController = require('../controllers/clientDocumentController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // ajuste se quiser

router.get('/clients/:clientId/documents', clientDocumentController.list);
router.post('/clients/:clientId/documents', upload.single('file'), clientDocumentController.upload);
router.get('/client-documents/:id/download', clientDocumentController.download);
router.delete('/client-documents/:id', clientDocumentController.remove);

module.exports = router;
