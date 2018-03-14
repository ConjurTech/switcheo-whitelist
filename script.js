const csv = require('csv');
const fs = require('fs');
const neon = require('neon-js');
const stream = require('stream');
const util = require('util');

const { sc, api, tx, rpc, u, wallet } = neon
const net = 'TestNet'
const contractHash = '78e6d16b914fe15bc16150aeb11d0c2a8e532bdd'
const gasAssetID = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'
const seederAddress = 'AHDfSLZANnJ4N9Rj3FCokP14jceu3u7Bvw'
const seederScriptHash = wallet.getScriptHashFromAddress(seederAddress)
const seederKey = ''
const batchSize = 5
const intents = [{ scriptHash: seederScriptHash, assetId: gasAssetID, value: 0.00000001 }]
const client = new rpc.RPCClient(net)
const source = fs.createReadStream('addresses.csv')
const parser = csv.parse()
const processor = csv.transform(function (row) { return row[0] })
let balances = null

// Initialize balance, resolve when everything is done
const run = new Promise(resolve => {
  api.neonDB.getBalance(net, seederAddress).then((b) => {
    balances = b
    main(resolve)
  })
})

// Main function
function main(resolve) {
  console.log('starting..');

  // Init vars
  let count = 0
  let sb = new sc.ScriptBuilder()

  // Setup invoke stream as a Writable
  function InvokeStream() { stream.Writable.call(this) };
  util.inherits(InvokeStream, stream.Writable);

  // Setup write handler
  InvokeStream.prototype._write = function (chunk, encoding, done) { // step 3
    console.log(chunk.toString());

    const last = chunk.toString() === '';
    if (!last) {
      const scriptHash = wallet.getScriptHashFromAddress(chunk.toString())
      sb.emitAppCall(contractHash, 'addToWhitelist', [u.reverseHex(scriptHash), '31'])
    }

    count++
    if (count >= batchSize || last) {
      console.log('pausing')
      const tryInvoke = () => {
        // invoke txn
        let txn = null
        try {
          txn = tx.Transaction.createInvocationTx(balances, intents, sb.str, 0, {})
        } catch (err) {
          // Not enough balances, wait then retry
          console.warn(err)
          return setTimeout(() => {
            api.neonDB.getBalance(net, seederAddress).then(b => {
              balances = b
              tryInvoke()
            })
          }, 10000)
          return
        }
        const signedTx = txn.sign(seederKey)
        client.sendRawTransaction(signedTx).then(result => {
          console.log(result)
          if (!result) {
            // Balance used, retry
            console.warn('txn failed!')
            return setTimeout(() => {
              api.neonDB.getBalance(net, seederAddress).then(b => {
                balances = b
                tryInvoke()
              })
            }, 10000)
          }
          count = 0
          sb = new sc.ScriptBuilder()
          console.log('resuming')
          done()
        }).catch(function(err) {
          console.warn(err)
        })
      }
      tryInvoke()
    } else {
      done()
    }
  }

  // Initialize invoker
  const invoker = new InvokeStream();
  invoker.on('finish', () => {
    resolve('done')
  })

  // Start
  source.pipe(parser).pipe(processor).pipe(invoker)
}

// Run till completion
run.then(r => console.log(r)).catch(err => console.log(err))
