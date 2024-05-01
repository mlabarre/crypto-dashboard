const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const MongoHelper = require('./mongo-helper')

/**
 * @param request HTTP request
 * @param request.body.walletName Name of wallet.
 * @param request.file Icon file.
 * @param response
 */
let addWallet = (request, response) => {
    const upload = multer({limits: {fileSize: 4000000}}).single('walletIcon');
    upload(request, response, async function (err) {
        if (err || request.file === undefined) {
            console.log(err);
            response.status(400).send("ko")
        } else {
            // everything worked fine // req.body has text fields, req.file has the file
            let fileName = request.body.walletName + ".png";
            await sharp(request.file.buffer) //.resize({ width: 400, height:400 }) Resize if you want
                .png().toFile(path.join(__dirname, '../public/images/icons/') + fileName)
                .catch(err => {
                    console.log('error: ', err)
                })
            await new MongoHelper().addWallet(request.body.walletName);
            response.status(200).send("ok")
        }
    })
}

let getWallets = async () => {
    return await new MongoHelper().findAllWalletsName();
}

exports.addWallet = addWallet
exports.getWallets = getWallets