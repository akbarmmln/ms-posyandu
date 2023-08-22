'use-strict';
const logger = require('../../../../config/logger');

exports.emailTemplate = async function(){
    try{
        const htmlTemplate = `
        <!DOCTYPE html>
        <head></head>
        <html lang="en">
            <body>
                Hi Sahabat
                <br><br>
                Silahkan download dokumen mu.
                <br>
                Thank you
                <br>
                Regards
                <br>
                ${process.env.NO_REPLY}
            </body>
        </html>`;

        return htmlTemplate;
    }catch(e){
        logger.error('error creating HTML', e.toString());
        throw e;
    }
};
