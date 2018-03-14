csv = require('fast-csv');
fs = require('fs');
neon = require('@cityofzion/neon-js');

console.log('start')

var stream = fs.createReadStream("addresses.csv");

const sc = neon.sc.default
const api = neon.api.default
const tx = neon.tx.default
const rpc = neon.rpc
console.log(neon)
var csvStream = csv
  .parse()
  .on("data", function (data) {
    console.log(data);
    // TODO: loop this shit

    const sb = new sc.create.scriptBuilder()
    const nodeURL = 'https://test-db.switcheo.network'
    console.log(neon)
    const addressToWhitelist = 'getThisFromCSVInAloop'
    const scriptHash = wallet.getScriptHashFromAddress(addressToWhitelist)
    sb.emitAppCall(scriptHash, 'individualCapOf', [u.reverseHex(wallet.getScriptHashFromAddress(addressToWhitelist))])

    var txn = null
    var balances = api.neonDB.getBalance(net.api, address).resolve()

    try {
      txn = tx.Transaction.createInvocationTx(balances, intents, invoke, gasCost, override)
    } catch (err) {
      console.log('Sorry, an error occured', err.message, 'error')
    }

    const signedTx = txn.sign(neon.default.get.privateKeyFromWIF('SomeWIF'))

    const client = rpc.RPCClient(net)
    client.sendRawTransaction(signedTx).then(function (result) {
        if (!result) {
          console.log('Pending Transaction', 'This address has outdated balances, please wait for the next block and try again.', 'error')
          return null
        }
        return signedTx

      })
      .on("end", function () {
        console.log("done");
      })
  })
stream.pipe(csvStream);