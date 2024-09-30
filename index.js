const { Client } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express')
const app = express()
const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.googlekey);

// ...

// The Gemini 1.5 models are versatile and work with most use cases
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

var islive=true;
const chat = model.startChat({

    generationConfig: {
        maxOutputTokens: 100,
    },
});

(async () => {
    try {


        // const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
        // const browser = await puppeteer.connect({ browserWSEndpoint: 'wss://chrome.browserless.io/' });

        // const browser = await puppeteer.launch({
        //     headless: true,
        //     executablePath: executablePath,
        //     args: ['--no-sandbox', '--disable-setuid-sandbox']
        // });

        console.log('Chromium launched successfully.');

        // Setup WhatsApp client with puppeteer
        const client = new Client({
            // puppeteer: {
            //     headless: true,
            //     executablePath: executablePath,
            //     args: ['--no-sandbox', '--disable-setuid-sandbox']
            // }
        });
var cmd ="";
client.on('qr', (qr) => {
    // Generate and scan this code with your phone
  qrcode.generate(qr, {small: true});

});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {

    if (msg.fromMe||!islive) {
        return;
    }

    if (msg.hasMedia&&msg.type=='ptt'||msg.type=='image') {


        const attachmentData = await msg.downloadMedia();
        const contact = await msg.getContact();

        const senderName = contact.pushname || contact.verifiedName || contact.formattedName;

        cmd=`${senderName}اسم المرسل:
                 ${msg.body}نص الرساله:
            `
        const result = await chat.sendMessage([
            {
                inlineData: {
                    data: attachmentData.data,
                    mimeType: attachmentData.mimetype

                },


            },{
                text: cmd
            }


        ]);

        const response = await result.response;
        const text = response.text();

        client.sendMessage(msg.from,text);



    }

    else  {

        try {
            const contact = await msg.getContact();
            const senderName = contact.pushname || contact.verifiedName || contact.formattedName;

            cmd=`${senderName}اسم المرسل:
                 ${msg.body}نص الرساله:
            `

            console.log(cmd);

            const result = await chat.sendMessage(cmd);
            const response = await result.response;
            const text = response.text();

            client.sendMessage(msg.from,text);

        } catch (e) {


        }

    }
    console.log(msg);


});

        client.initialize();

    } catch (error) {
        console.error('Error:', error);
    }
})();

//



app.get('/getlive', function (req, res) {
    res.status(200).json({
        "islive":islive
    })
})

app.get('/setlive', function (req, res) {
    res.status(200).json({
        "islive":islive=!islive
    })
})




app.listen(8080,()=>{
    console.log("server is running on port hokahmaxxxx...,x");

})


