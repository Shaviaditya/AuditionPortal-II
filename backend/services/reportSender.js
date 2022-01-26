const nodemailer = require('nodemailer');
const {parentPort,isMainThread} = require('worker_threads');
if(!isMainThread){
    parentPort.on('message',async (data)=>{
        console.log(data)
        const package = JSON.parse(JSON.stringify(data))
        parentPort.postMessage(await sendMail(package.subject,package.text,package.list))
    })
}
let sendMail = async (subject, text, to) => {
    try {
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
        transporter.sendMail(message, (err,data) => {
            if(err){
                console.log(err)
            } else {
                console.log(`Message sent success!!!`)
                return `Message sent success!!!`;
            }
        });

    } catch (err) {
        console.log(err);
        return err;
    }
}
module.exports = {
     sendMail  
};