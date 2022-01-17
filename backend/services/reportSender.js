const nodemailer = require('nodemailer');
let sendMail = async (subject, text, to) => {
    try {
        // console.log(subject)
        // console.log(text)
        console.log("to --- " + to);
        const transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            secure: true,
            port: 465,
            auth:{
                user: process.env.MAILGUN_USER,
                pass: process.env.MAILGUN_PASSWORD,
            },

        });
        transporter.verify( function (err, success){
            if(err){
                console.log(err);
            } else {
                console.log("Server is ready to take our messages");
            }
        });

        const message = {
            from: `GNU/Linux Users' Group <${process.env.MAILER}>`,
            to:to,
            subject:subject,
            html: text,
        };
        // console.log(message);
        transporter.sendMail(message, (err,data) => {
            if(err){
                console.log(err)
            } else {
                console.log(`Message sent success!!!`)
            }
        });

    } catch (err) {
        console.log(err);
    }
    // workerpool.worker({sendMail})
}
module.exports = {
     sendMail  
};