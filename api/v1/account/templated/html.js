'use-strict';

const logger = require('../../../config/logger');
const format = require('../../../config/format');
const moment = require('moment');

exports.getReceiptv3 = async function (getheaderdetailkuitansi) {
    try {
        let renderTablePayment = '', renderTablePaymentSisa = '', totalBayar = 0;
        let noTrx = getheaderdetailkuitansi.data.noTrx;
        let trxDate = getheaderdetailkuitansi.data.trxDate;
        trxDate = await format.dateFormatIndo(moment(trxDate, 'YYYY-MM-DD HH:mm:ss.S').format('YYYY-MM-DD'));
        // trxDate = await format.dateFormatIndo(moment().format('YYYY-MM-DD'))
        let contNo = getheaderdetailkuitansi.data.contNo;
        let custName = getheaderdetailkuitansi.data.custName;
        let colaPlatNo = getheaderdetailkuitansi.data.colaPlatNo;
        let jthTempo = getheaderdetailkuitansi.data.jthTempo;
        // jthTempo = await format.dateFormatIndo(moment(jthTempo).format('YYYY-MM-DD'))
        jthTempo = await format.dateFormatIndo(moment(jthTempo, 'DD-MMM-YYYY').format('YYYY-MM-DD'));
        let sisaHutang = getheaderdetailkuitansi.data.sisaHutang;
        sisaHutang = await format.rupiahFormat(sisaHutang, ".");
        let kumulatifDenda = getheaderdetailkuitansi.data.kumulatifDenda;
        kumulatifDenda = await format.rupiahFormat(kumulatifDenda, ".");
        let lokasiPembayaran = getheaderdetailkuitansi.data.lokasiPembayaran;
        let namaPegawai = getheaderdetailkuitansi.data.namaPegawai;
        let terbilang = getheaderdetailkuitansi.data.terbilang;
        let listBiaya = getheaderdetailkuitansi.data.listBiaya;
        for await (const detail of listBiaya) {
            totalBayar += parseInt(detail.jumlah)
            renderTablePayment +=
            `<tr>
            <td colspan="2" style="font-family:Open Sans; font-size: 9px; padding-left: 5px; text-align: left; border-bottom:none;border-top:none;">${detail.keterangan}</td>
            <td style="font-family:Open Sans; font-size: 9px; padding-right: 5px; text-align: right; border-bottom:none;border-top:none;">${await format.rupiahFormat(detail.jumlah, ".")}</td>
            </tr>`;
        }
        let total_listBiaya = parseInt(listBiaya.length)
        let total_baris = 10
        let sisa = total_baris - total_listBiaya
        for(let i=0; i<sisa; i++){
            renderTablePaymentSisa += 
            `<tr>
            <td colspan="2" style="font-family:Open Sans; font-size: 9px; padding-left: 5px; text-align: left; border-bottom:none;border-top:none;">&nbsp;</td>
            <td style="font-family:Open Sans; font-size: 9px; padding-right: 5px; text-align: right; border-bottom:none;border-top:none;">&nbsp;</td>
            </tr>`;
        }

        return `
        <!DOCTYPE html>
        <html>
        
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;600;700&display=swap" rel="stylesheet">
        
            <style>
                .demo-bg {
                      opacity: 0.1;
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      height: auto;
                }

                * {
                    box-sizing: border-box;
                }
        
                .column {
                    float: left;
                    padding: 10px;
                    height: 300px;
                }
        
                .left,
                .right {
                    width: 44.5%;
                }
        
                .middle {
                    width: 11%;
                }
        
                h1 {
                    display: table;
                    margin: 4px 1px 0px 10px;
                    padding: 2px;
                    font-family: Open Sans;
                    font-size: 8px;
                    background-color: #dee3e3;
                }
        
                h2 {
                    display: table;
                    margin: 4px 1px 0px 10px;
                    padding: 2px;
                    font-family: Open Sans;
                    font-size: 8px;
                }
        
                p {
                    display: table;
                    margin: 4px 1px 0px 10px;
                    padding: 2px;
                    font-family: Open Sans;
                    font-size: 8px;
                }
        
                .row:after {
                    content: "";
                    display: table;
                    clear: both;
                }
                
                th, td, tr {
                    border-color:#000000
                }
            </style>
        </head>
        
        <body>
        <img
    class="demo-bg"
    src="https://adiraku-bucket-dev.oss-ap-southeast-5.aliyuncs.com/banner/watermark-kuitansi%20teller.png"
    alt=""
  >
            <div class="row">
                <div class="column left"><br /><strong style="font-family: Open Sans; font-size: 14px;">KUITANSI PEMBAYARAN</strong>
                    <table style="border-collapse: collapse; width: 100%; height: 21px;">
                        <tbody>
                            <tr style="height: 21px;">
                                <td style="width: 30%; height: 21px;">
                                    <table style="border-collapse: collapse; width: 100%;">
                                        <tbody>
                                            <tr>
                                                <td style="width: 100%; font-family: Open Sans; font-size: 9px;">No. Transaksi</td>
                                            </tr>
                                            <tr>
                                                <td style="width: 100%; font-family: Open Sans; font-size: 9px;">Tgl. Transaksi</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style="width: 70%; height: 21px;">
                                    <table style="border-collapse: collapse; width: 70%; height: 36px;" border="1">
                                        <tbody>
                                            <tr style="height: 18px;">
                                                <td style="width: 100%; height: 18px; font-family: Open Sans; font-size: 9px;">${noTrx}</td>
                                            </tr>
                                            <tr style="height: 18px;">
                                                <td style="width: 100%; height: 18px; font-family: Open Sans; font-size: 9px;">${trxDate}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table style="border-collapse: collapse; width: 100%; height: 162px;">
                        <tbody>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">No. Kontrak</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${contNo}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Nama Konsumen</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${custName}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">No. Polisi</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${colaPlatNo}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Tgl. Jatuh Tempo</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${jthTempo}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Sisa Hutang</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${sisaHutang}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Kumulatif Denda</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${kumulatifDenda}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Lokasi Pembayaran</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${lokasiPembayaran}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Nama Petugas</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${namaPegawai}</td>
                            </tr>
                            <tr style="height: 18px;">
                                <td style="font-family: Open Sans; font-size: 9px; width: 30%; height: 18px;">Terbilang</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 5%; height: 18px;">:</td>
                                <td style="font-family: Open Sans; font-size: 9px; width: 65%; height: 18px;">${terbilang}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>Lindungi motor &amp; jiwa anda dengan Motorku AMAN <br/> * Berlaku hanya 1bln dari skrg (SK Khusus penawaran asuransi) <br/> Per 1-May-2015 pembayaran Angsuran melalui Kasir Cabang/RO/Kios akan di kenakan biaya sesuai ketentuan</p>
                </div>
                <div class="column middle"><br /><img style="vertical-align:middle;margin:5px 0px 0px 10px" src="https://adira-akses-prod.oss-ap-southeast-5.aliyuncs.com/IconImage/Raku-e-Materai%404x.png" alt="" width="60" height="65" /></div>
                <div class="column right"><br /><img style="vertical-align:middle;margin:0px 0px 0px -1px" src="https://adira-akses-prod.oss-ap-southeast-5.aliyuncs.com/IconImage/Body-e-Materai%404x.png" alt="" width="250" height="70" />
                    <table style="border-collapse: collapse; width: 100%;">
                        <tbody>
                            <tr>
                                <td style="width: 1%;">&nbsp;</td>
                                <td style="width: 99%;">
                                    <table style="border-collapse: collapse; width: 100%;" border="1">
                                        <tbody>
                                            <tr>
                                                <td style="width: 50%; text-align: center; font-family: Open Sans; font-size: 9px;" colspan="2"><strong>KETERANGAN</strong></td>
                                                <td style="width: 50%; text-align: center; font-family: Open Sans; font-size: 9px;"><strong>JUMLAH</strong></td>
                                            </tr>
                                            ${renderTablePayment}
                                            ${renderTablePaymentSisa}
                                            <tr>
                                                <td style="width: 33%; boder: 1px solid; border-left: 1px solid transparent; border-bottom: 1px solid transparent;">&nbsp;</td>
                                                <td style="width: 33%; text-align: center; font-family: Open Sans; font-size: 9px;"><strong>TOTAL</strong></td>
                                                <td style="width: 34%; padding-right: 7px; text-align: right; font-family: Open Sans; font-size: 9px;"><strong>${await format.rupiahFormat(totalBayar, ".")}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <br />
            <h1>Mohon diperiksa kembali jumlah yang tertera pada bukti setoran</h1>
            <h2>Adira Finance berizin dan diawasi oleh Otoritas Jasa Keuangan</h2>
        </body>
        
        </html>
        `;
    } catch (e) {
        logger.errorWithContext({error: e, message: 'error creating receipt html'})
        throw e;
    }
}