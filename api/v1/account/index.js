const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/list-peserta', controller.list_peserta);
router.post('/search-peserta', controller.search_peserta);
router.post('/detail-peserta-byid', controller.detail_peserta_byid);

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/lupapassword', controller.lupapassword);
router.post('/upload-kartu-keluarga', controller.uploadKartuKeluarga);

router.post('/register-kader', controller.register_kader);
router.post('/list-kader', controller.list_kader);
router.post('/login-kader', controller.login_kader);
router.post('/lupapassword-kader', controller.lupapassword_kader);
router.post('/remove-account', controller.removeAccount);

router.post('/check-nik-peserta', controller.check_nik_peserta);

router.post('/save-checkup-balita', controller.save_checkup_balita);
router.post('/update-checkup-balita', controller.update_checkup_balita);
router.post('/delete-checkup-balita', controller.delete_checkup_balita);
router.post('/list-checkup-balita', controller.list_checkup_balita);
router.post('/search-checkup-balita', controller.search_checkup_balita);

router.post('/save-checkup-lansia', controller.save_checkup_lansia);
router.post('/update-checkup-lansia', controller.update_checkup_lansia);
router.post('/delete-checkup-lansia', controller.delete_checkup_lansia);
router.post('/list-checkup-lansia', controller.list_checkup_lansia);
router.post('/search-checkup-lansia', controller.search_checkup_lansia);

router.post('/save-checkup-hamil', controller.save_checkup_hamil);
router.post('/update-checkup-hamil', controller.update_checkup_hamil);
router.post('/delete-checkup-hamil', controller.delete_checkup_hamil);
router.post('/list-checkup-hamil', controller.list_checkup_hamil);
router.post('/search-checkup-hamil', controller.search_checkup_hamil);

router.post('/define-grafik/balita', controller.define_grafik_balita);
router.post('/define-grafik/lansia', controller.define_grafik_lansia);
router.post('/define-grafik/ibu-hamil', controller.define_grafik_ibu_hamil);

router.post('/notifikasi', controller.notifikasi);
router.post('/list-activity', controller.list_activity);
router.post('/get-id-checkup-balita', controller.getIDCheckupBalita);
router.post('/get-id-checkup-ibu-hamil', controller.getIDCheckupIbuHamil);
router.post('/get-id-checkup-lansia', controller.getIDCheckupLansia);
router.post('/save-feedback', controller.saveFeedback);
router.post('/data-pengunjung', controller.dataPengunjung);

router.post('/upload-file-single', controller.uploadFileSingle);
router.post('/upload-file-multipart', controller.uploadFileMultipart);
router.post('/upload-file-chunck', controller.uploadFileChunk);
router.get('/list-bucket', controller.listBucket);
router.post('/join', controller.join);

router.post('/logout', controller.logout);

router.post('/receipt', controller.paymentReceipt);
router.post('/receipt-v2', controller.paymentReceiptV2);

module.exports = router;