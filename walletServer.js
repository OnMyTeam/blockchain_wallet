const express = require('express');
const db_config = require(__dirname+'/src/public/js/database.js');
const fs = require('fs');
const ethers = require('ethers');
const keythereum = require('keythereum');
const path = require('path');
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const { privateKeyToAddress } = require('keythereum');
const { entropyToMnemonic, randomBytes, HDNode } = require('ethers/lib/utils');
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/6d0db331b03946feb41e4bfad99423c4'))
const Wallet = require("ethereumjs-wallet").default;
// const { json } = require('body-parser');

const app = express();
var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/src/public'));
app.set('view engine','ejs');
app.set('views','./src/views');
app.use(bodyParser.urlencoded({ extended: false}))
app.set('port', process.env.PORT || 3001 );
// app.use(express.static('front'))
app.use(express.json());
var conn = db_config.init();

  


app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, "/src/"));
    res.render('index');
});

app.post('/create_wallet', (req, res) => {

    const id = req.body.id;
    const mnemonic = req.body.mnemonic;
    const password = req.body.password;

    console.log("mnemonic: ",mnemonic);
    console.log("password: ",password);

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const privateKey = wallet.privateKey.substring(2);
    
    

    const pk = new Buffer.from(privateKey, "hex");

    

    const account = Wallet.fromPrivateKey(pk);
    console.log(account);

    const address = account.getAddressString()

    const keyStoreFilename = account.getV3Filename();

    console.log(keyStoreFilename);

    account.toV3('password').then(function (data) {
        console.log("성공"); 
        console.log(data);
        const jsonContent = JSON.stringify(data);
        

        mkdir("./keyfiles");
        var file_path = `./keyfiles/${keyStoreFilename}`;
        fs.writeFile(file_path, jsonContent, function (err, dara) {
            if(err) {
                res.status(999).send("실패")                
            }
            else {
                var id_index;
                // id별 index값 불러오기
                var sql = 'SELECT  id_index FROM walletdb.user';
                    sql += ' where id = \''+id+'\' order by id_index desc limit 1';
                    
                conn.query(sql, function(err,result) {
                    if(err) console.log('query is not excuted. insert fail...\n' + err);
                    else {
                        id_index = result[0].id_index;                        
                        var sql = 'INSERT INTO user(id, id_index, pwd, address, file_path)'
                        sql += ' VALUES(?, ?, ?, ?, ?)';
                        var params = ['sangiki82', id_index+1, password, address, file_path];
                        conn.query(sql, params, function(err) {
                            if(err) console.log('query is not excuted. insert fail...\n' + err);
                            else res.status(200).json({response: 200});
                        });                            
                    }
                    
                });                
                    
            
                

            }
        });
    });



    

    

});

app.get('/users', (req, res) => {
    console.log('b');

    console.log(users);

    res.send(users);
});

app.post('/mnemonic', (req,res) => {

    // let mnemonic = wallet.keystore.generateRandomSeed();
    
    let mnemonic = entropyToMnemonic(ethers.utils.randomBytes(16));
    res.status(200).json({response: 200, mnemonic:mnemonic});
    
});

app.get('/balance', async (req, res) => {

    let eth = 0;
    console.log(req.body);
    const address = req.body.address;

    await web3.eth.getBalance( address , async (err,data) => {
        if (err) console.log(err);
        eth = data.toString();
    });
    res.json({code:1, eth:eth });

});

app.post('/transaction', (req, res) => {

    // const send_account = req.body.address;
    // console.log(send_account);
    // const privateKey = req.body.privateKey.toString();
    // console.log(privateKey);
    // const receive_account = req.body.receive_account;
    // const ether_value = req.body.ether_value;  // 0.1ether
    // const password = req.body.password;  // password
    
    
    // const send_account = '0x1ed14542bfde8d84d82dfa8b43ec12d2c510361c';
    const receive_account = "0xEcb86Ec14185aE64Ae835EBFD72b50FC7fa085d2";
    const utcFile = "UTC--2021-10-06T05-49-33.916Z--b5bb5716005a5648a9c19440b1baa02ef51c2c92";
    const password = "password"
    // const privateKey = '8a9214c740bb26055a37789dc3ff31b13794b990f29822e0733e60c3fd2dde89';
    // let new_privateKey = new Buffer(privateKey, "hex");
    // console.log(new_privateKey);
    // Asynchronous
    const keyObject = JSON.parse(fs.readFileSync(`./keyfiles/${utcFile}`).toString());
    const privateKey = new Buffer.from(keythereum.recover(password, keyObject), "hex"); 
    const send_account = '0xb5bb5716005a5648a9c19440b1baa02ef51c2c92'
    // console.log(privateKey.to)
    
    // let wallets = fs.readFileSync(`./keyfiles/${send_account}keystore.json`);
    // let keyObject = wallet.keystore.deserialize(wallets);


    const value = web3.utils.toWei('0.1', 'ether')  // 0.1ether
    const hex_value = web3.utils.toHex(value)

    web3.eth.getTransactionCount(send_account, (err, txCount) => { // (1)

        const txObject = {
            nonce: web3.utils.toHex(txCount),
            gasLimit: web3.utils.toHex(1000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
            to: receive_account,
            value: hex_value,
        }
        console.log(txObject);

        // create Tx
        const tx = new Tx(txObject, { chain: 'ropsten', hardfork: 'petersburg' });
        // signed Tx
        tx.sign(privateKey)
        const serializedTx = tx.serialize()
        const raw = "0x" + serializedTx.toString("hex")

        // send Tx
        web3.eth
            .sendSignedTransaction(raw) //(2)
            .once("transactionHash", hash => {
                console.info("transactionHash", "https://ropsten.etherscan.io/tx/" + hash) // tx가 pending되는 즉시 etherscan에서 tx진행상태를 보여주는 링크를 제공해df.
            })
            .once("receipt", receipt => {
                console.info("receipt", receipt) // 터미널에 receipt 출력
            })
            .on("error", console.error)
    })
});

app.get('/import/privatekey', (req, res) => {

    // const privateKey = '8a9214c740bb26055a37789dc3ff31b13794b990f29822e0733e60c3fd2dde89';

    const privateKey = req.body.privateKey;
    const password = 'password';
    const strPrivateKey = privateKey.toString();
    
    try {
        const pk = new Buffer.from(strPrivateKey, "hex");

        const account = Wallet.fromPrivateKey(pk);
        const address = account.getAddressString();

        console.log(address);

        const keyStoreFilename = account.getV3Filename();

        account.toV3(password).then(function (data) {
            console.log("성공");
            console.log(data);
            const jsonContent = JSON.stringify(data);
            mkdir("./keyfiles");

            fs.writeFileSync(`./keyfiles/${keyStoreFilename}`, jsonContent, function (err, data) {
                if(err) res.status(999).send("저장 실패")
                else res.status(201).send("저장 성공")
            });

            res.send("오예")
        });
    } catch (exception) { 
        console.log(`importing ${exception}`);
    }

});

app.get('/import/UTCfile', (req, res) => {
    
});



app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
});

function mkdir( dirPath ) {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}



module.exports = {
    "server": {
      "baseDir": ["../src"],
      "routes": {
        "/node_modules": "node_modules"
      },
      middleware: {
        1: app,
      },
    },
    port: 3000,
  };
