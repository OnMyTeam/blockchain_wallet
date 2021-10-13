const express = require('express');
const db_config = require(__dirname+'/src/public/js/database.js');
const fs = require('fs');
var cors = require('cors');
const ethers = require('ethers');
const keythereum = require('keythereum');
const path = require('path');
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const { privateKeyToAddress } = require('keythereum');
const { entropyToMnemonic, randomBytes, HDNode } = require('ethers/lib/utils');
let web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.154.19:22000'))
const Wallet = require("ethereumjs-wallet").default;
const Common = require("ethereumjs-common").default;
// const { json } = require('body-parser');

const app = express();
var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/src/public'));
app.set('view engine','ejs');
app.set('views','./src/views');
app.use(bodyParser.urlencoded({ extended: false}));
app.set('port', process.env.PORT || 3001 );
// app.use(express.static('front'))
app.use(express.json());
app.use(cors());
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
    
account.getPrivateKeyString()
    const address = account.getAddressString()
    
    console.log("private ",account.getPrivateKeyString())
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
                        console.log("result:",result);
                        if (result.length == 0){
                            id_index = 0
                        }else{
                            id_index = result[0].id_index + 1;
                        }
                        
                        
                        var sql = 'INSERT INTO user(id, id_index, pwd, address, file_path)'
                        sql += ' VALUES(?, ?, ?, ?, ?)';
                        var params = ['sangiki82', id_index, password, address, file_path];
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
app.get('/accountlist', (req, res) => {
    const id = req.query.id;
    console.log(id);
    var sql = 'SELECT  id, id_index, address, file_path FROM walletdb.user';
    sql += ' where id = \''+id+'\' order by id_index';

    conn.query(sql, function(err,result) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else {
            
            res.json(result);
        }
        
    }); 
    
});

app.post('/remove', (req, res) => {
    const id = req.body.id;
    const id_index = req.body.id_index;
    console.log(id);
    console.log(id_index);
    var sql = 'SELECT  file_path FROM walletdb.user';
    sql += ' where id = \''+id+'\' and id_index = '+id_index;

    conn.query(sql, function(err,result) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else {
            const flle_path = result[0].file_path;
            console.log(flle_path);

            var sql = 'delete FROM walletdb.user';
            sql += ' where id = \''+id+'\' and id_index = '+id_index;

            conn.query(sql, function(err, result) {
                if(err) console.log('query is not excuted. insert fail...\n' + err);
                else {

                    if (result.affectedRows == 1){
                        fs.unlink(flle_path, function(err){
                            if(err) {
                              console.log("Error : ", err)
                            }
                          })
                        res.status(200).json({response: 200})   
                    }
                    else{
                        res.status(400).json({response: 400})   
                    }
                    
                }
            });                 
            
        }
        
    }); 
    
});


app.post('/mnemonic', (req,res) => {

    // let mnemonic = wallet.keystore.generateRandomSeed();
    
    let mnemonic = entropyToMnemonic(ethers.utils.randomBytes(16));
    res.status(200).json({response: 200, mnemonic:mnemonic});
    
});

app.get('/balance', async (req, res) => {

    let eth = 0;
    console.log(req.query.address);
    const address = req.query.address;

    await web3.eth.getBalance( address , async (err,data) => {
        if (err) console.log(err);
        eth = data.toString();
    });
    res.json({code:1, eth:eth });

});

app.get('/getInfoforTx', (req, res) => {
    const id = req.query.id;
    const id_index = req.query.id_index;
    console.log(id);
    console.log(id_index);
    var sql = 'SELECT  address, file_path FROM walletdb.user';
    sql += ' where id = \''+id+'\' and id_index = '+id_index;

    conn.query(sql, function(err,result) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else {
            res.json(result);
        }
        
    }); 
    
});

app.post('/transaction', (req, res) => {

    const send_account = req.body.send_address;
    // console.log(send_account);
    // const privateKey = req.body.privateKey.toString();
    // console.log(privateKey);
    const receive_account = req.body.receive_address;
    const ether_value = req.body.ether_value;  // 0.1ether
    const password = req.body.password;  // password
    
    
    // const send_account = '0x1ed14542bfde8d84d82dfa8b43ec12d2c510361c';
    // const receive_account = "0x73c3f56026c760a92471234bb42e9ce9c6ea889b";
    const utcFile = req.body.filePath;
    // const password = "aaa"
    // const privateKey = '8a9214c740bb26055a37789dc3ff31b13794b990f29822e0733e60c3fd2dde89';
    // let new_privateKey = new Buffer(privateKey, "hex");
    // console.log(new_privateKey);
    // Asynchronous
    const keyObject = JSON.parse(fs.readFileSync(`${utcFile}`).toString());
    const privateKey = new Buffer.from(keythereum.recover(password, keyObject), "hex"); 
    // const send_account = '0xce22a009378fbd0136e2e5c9cee9b607121ba3de'


    const value = web3.utils.toWei(ether_value, 'ether')  // 0.1ether
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

        const cutsomCommon = Common.forCustomChain(
            'mainnet',
            {
                name: 'my-network',
                networkId: 10,
                chainId: 10,
            },
            'istanbul',
        )

        // create Tx
        const tx = new Tx(txObject, { common: cutsomCommon });
        // signed Tx
        tx.sign(privateKey)
        const serializedTx = tx.serialize()
        const raw = "0x" + serializedTx.toString("hex")

        // send Tx
        web3.eth
            .sendSignedTransaction(raw) //(2)
            .once("transactionHash", hash => {
                console.info("transactionHash", hash) // tx가 pending되는 즉시 etherscan에서 tx진행상태를 보여주는 링크를 제공해df.
            })
            .once("receipt", receipt => {
                console.info("receipt", receipt) // 터미널에 receipt 출력
                res.status(200).json({response: 200});
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
