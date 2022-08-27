const puppeteer = require('puppeteer-extra');
const fs = require("fs");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

var defaultpath = __dirname;

async function readlinewithcallback(callback)
{
    readline.question(`Link to https://signalstickers.com/ : `, (url) => {
        if(url.includes("https://signalstickers.com/pack"))
        {
            callback(url)
        } else {
        console.log("Not valid link, please try again")
        }
        readline.close();
      });
}

async function run (url){
    const browser = await puppeteer.launch({headless:true})

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })
    const title = await page.evaluate(() => document.querySelector(".col-lg-8 > h1:nth-child(1)").textContent)
    console.log("Title : " + title)
    defaultpath = __dirname + "\\" + title.replaceAll(" ", "_")
    console.log("We will start to download images, they will be saved in " + defaultpath)
    const emoji = await page.evaluate(() => {
        const stickers = Array.from(document.querySelectorAll('.sahlm9h'))
        
        return stickers.map(sticker => sticker.querySelector(".emoji").textContent)
    })
    const urls = await page.evaluate(() => {
        const stickers = Array.from(document.querySelectorAll('.sahlm9h'))
        
        return stickers.map(sticker => sticker.querySelector("img").src)
    })
    emoji.forEach(async (sticker, index) => {
        var emoji = sticker
        var imagedata = urls[index]
        var name = "\\" + emoji + "." + imagedata.split(";")[0].replace("data:image/", "")
        if(!fs.existsSync(defaultpath)){
            fs.mkdirSync(defaultpath)
        }
        if(fs.existsSync(defaultpath + name)){
            var i = 0
            fs.readdirSync(defaultpath).forEach(file => {
                if(file.includes(emoji))
                {
                  i++
                }
            })

            name = name.replace(emoji, emoji + `(${i})`)
        }
            
        fs.writeFileSync(defaultpath + name, imagedata.split(";")[1].split(",")[1], "base64")
    })

    browser.close()
}

readlinewithcallback((url) => {
    run(url)
})