'use-strict';
const logger = require('../../../../config/logger');
const format = require('../../../../config/format');

exports.getHTML = async function() {
    try{
        return `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <title>Simple invoice html template</title>
                <style type="text/css">
                    .container {
                        width: auto;
                        height: 190px;
                    }
            
                    .rotate_image {
                        -webkit-transform: rotate(40deg);
                        -moz-transform: rotate(40deg);
                        -ms-transform: rotate(40deg);
                        -o-transform: rotate(40deg);
                        transform: rotate(40deg);
                    }
                    
                    #from {
                        float: left;
                        width: 100%;
                        background: #efefef;
                        margin-top: 0px;
                        font-size: 90%;
                        padding: 1.5%
                    }
            
                    #from1 {
                        float: left;
                        width: 100%;
                        background: #ffffff;
                        margin-top: 0px;
                        font-size: 90%;
                        padding: 1.5%
                    }
            
                    #st-box {
                        float: left;
                        width: 175px;
                        height: auto;
                        margin-left: 10px;
                        padding: 0.5%;
                        background-color: #efefef;
                    }
            
                    #st-box1 {
                        float: left;
                        width: 360px;
                        height: auto;
                        margin-left: 10px;
                    }
            
                    #st-box2 {
                        float: right;
                        width: 180px;
                        height: auto;
                        margin-right: 15px;
                    }
            
                    #nd-box {
                        float: left;
                        width: 175px;
                        height: auto;
                        padding: 0.5%;
                        background-color: #efefef;
                        margin-left: 15px;
                    }
            
                    #rd-box {
                        float: right;
                        width: 175px;
                        height: auto;
                        margin-right: 15px;
                        padding: 0.5%;
                        background-color: #efefef;
                    }
            
                    .centerDiv1 {
                        width: 75%;
                        height: 20px;
                        margin: 0 auto;
                        background-color: #ad76a0;
                    }
            
                    .centerDiv2 {
                        width: 75%;
                        height: auto;
                        margin: 0 auto;
                        background-color: #FFFFFF;
                    }
            
                    .clearfix:after {
                        content: "";
                        display: table;
                        clear: both;
                    }
            
                    a {
                        color: #5D6975;
                        text-decoration: underline;
                    }
            
                    body {
                        position: relative;
                        width: 21cm;
                        height: 29.7cm;
                        margin: 0 auto;
                        color: #001028;
                        background: #FFFFFF;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-family: Arial;
                    }
            
                    header {
                        padding: 10px 0;
                        margin-bottom: 0px;
                    }
            
                    #logo {
                        text-align: center;
                        margin-bottom: 10px;
                    }
            
                    #logo img {
                        width: 90px;
                    }
            
                    h1 {
                        font-weight: normal;
                        text-align: center;
                        margin: 0 0 20px 0;
                    }
            
                    #project {
                        float: left;
                    }
            
                    #project span {
                        color: #5D6975;
                        text-align: right;
                        width: 52px;
                        margin-right: 10px;
                        display: inline-block;
                        font-size: 0.8em;
                    }
            
                    #company {
                        float: right;
                        text-align: right;
                    }
            
                    #project div,
                    #company div {
                        white-space: nowrap;
                    }
            
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        border-spacing: 0;
                        margin-bottom: 0px;
                        text-align: center;
                    }
            
                    footer {
                        color: #5D6975;
                        width: 100%;
                        height: 30px;
                        position: absolute;
                        bottom: 0;
                        border-top: 1px solid #C1CED9;
                        padding: 8px 0;
                        text-align: center;
                    }
                </style>
            </head>
            
            <body>
                <body style="background-color:#8ab5b8; margin-top:10%;">
                    <div class="centerDiv1">
                    </div>
                    <div class="centerDiv2">
                        <table style="width: 100%; font-size:15px;">
                            <tbody>
                                <tr>
                                    <td style="text-align:left;width: 100%;">
                                        <!--<img style="margin-left:50px" src="https://adira-akses-prod.oss-ap-southeast-5.aliyuncs.com/restruktur/header.png">-->
                                    </td>
                                    <td style="text-align:right;width: 100%;">
                                        <img style="margin-right:50px" src="https://adira-akses-prod.oss-ap-southeast-5.aliyuncs.com/restruktur/header.png">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="container">
                            <div id="st-box">
                                <div id="from">
                                    <p>
                                        <strong>Tagihan Kepada</strong>
                                        <br><br> 3671082608940001
                                        <br> Mujiharto
                                        <br><br> Jalan Bumi Ayu, Blok I-5 No 22
                                        <br> Tangerang, Banten
                                        <br> 15133
                                    </p>
                                </div>
                            </div>
                            <div id="nd-box">
                                <div id="from">
                                    <p>
                                        <strong>Dibayarkan Kepada</strong>
                                        <br><br> 0000000000000000
                                        <br> Kas RT 004 RW 008
                                        <br><br> Jalan Bumi Ayu, Blok I-6 No 01
                                        <br> Tangerang, Banten
                                        <br> 15133
                                    </p>
                                </div>
                            </div>
                            <div id="rd-box">
                                <div id="from">
                                    <p>
                                        <strong>Nomor Pembayaran</strong>
                                        <br> INV/202211/140752123456789
                                        <br><br>
                                        <strong>Tanggal Dibuat</strong>
                                        <br> 26 Januari 2022 12:00:00
                                        <br><br>
                                        <strong>Batas Waktu</strong>
                                        <br> 26 Januari 2022 13:00:00
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:-40px; margin-left:10px;; margin-right:10px;">
                            <table style="width: 100%;">
                                <tbody>
                                    <tr>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; height:30px; text-align:center"><strong>Item</strong></td>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; height:30px; text-align:center"><strong>Harga</strong></td>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; height:30px; text-align:center"><strong>Total</strong></td>
                                    </tr>
                                    <tr>
                                        <td bgcolor="#ffffff" style="font-size:13px; padding: 15px; text-align:left; color:#bab980">PKBM, PKSP, PPKP, PSBM (Oktober)</td>
                                        <td bgcolor="#ffffff" style="font-size:13px; padding: 15px; text-align:right; color:#bab980">Rp. 40.000</td>
                                        <td bgcolor="#ffffff" style="font-size:13px; padding: 15px; text-align:right; color:#bab980">Rp. 40.000</td>
                                    </tr>
                                    <tr>
                                        <td bgcolor="#ffffff" style="font-size:13px;padding: 15px; text-align:left; color:#bab980">PKBM, PKSP, PPKP, PSBM (November)</td>
                                        <td bgcolor="#ffffff" style="font-size:13px; padding: 15px; text-align:right; color:#bab980">Rp. 40.000</td>
                                        <td bgcolor="#ffffff" style="font-size:13px; padding: 15px; text-align:right; color:#bab980">Rp. 40.000</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; text-align:left">Sub Total</td>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; text-align:right">Rp. 80.000</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; text-align:left">Biaya Admin</td>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; text-align:right">Rp. 4.500</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; padding-bottom: 15px; text-align:left">Total Bayar</td>
                                        <td bgcolor="#f0b6e2" style="font-size:15px; padding-left: 15px; padding-right: 15px; padding-top: 15px; padding-bottom: 15px; text-align:right">Rp. 84.500</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <br>
            
                        <div class="container">
                            <div id="st-box1">
                                <div id="from1">
                                    <p>
                                        <strong>Status Pembayaran / Transaksi ID</strong>
                                        <p style="color:red">LUNAS / PE16OAZA0PZPA84G</p>
                                        <strong>Metode Pembayaran</strong>
                                        <p style="color:red">ATM BERSAMA (ONLINE)</p>
                                    </p>
                                </div>
                            </div>
                            <div id="st-box2">
                                <div id="from1">
                                    <img class="rotate_image" width="150" height="100" src="https://www.linkpicture.com/q/paid_1.png">
                                </div>
                            </div>
                            <img style="width:100%;" src="https://adira-akses-prod.oss-ap-southeast-5.aliyuncs.com/restruktur/Vector.png">
                            <p style="text-align:center">SIMPAN TANDA TERIMA INI SEBAGAI BUKTI BAYAR YANG SAH</p>
                        </div>
                    </div>
                    <div class="centerDiv1">
                    </div>
                </body>
            </body>
            </html>
        `;
    }catch(e){
        logger.error('error creating HTML', e.toString());
        throw e;
    }
}