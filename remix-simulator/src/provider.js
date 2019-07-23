var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext

const log = require('./utils/logs.js')
const merge = require('merge')

const Accounts = require('./methods/accounts.js')
const Blocks = require('./methods/blocks.js')
const Filters = require('./methods/filters.js')
const Misc = require('./methods/misc.js')
const Net = require('./methods/net.js')
const Transactions = require('./methods/transactions.js')
const Whisper = require('./methods/whisper.js')

const generateBlock = require('./genesis.js')

var Provider = function (options) {
  this.Accounts = new Accounts()

  this.methods = {}
  this.methods = merge(this.methods, this.Accounts.methods())
  this.methods = merge(this.methods, (new Blocks(options)).methods())
  this.methods = merge(this.methods, (new Misc()).methods())
  this.methods = merge(this.methods, (new Filters()).methods())
  this.methods = merge(this.methods, (new Net()).methods())
  this.methods = merge(this.methods, (new Transactions(this.Accounts.accounts)).methods())
  this.methods = merge(this.methods, (new Whisper()).methods())

  generateBlock()

  setTimeout(() => {
    console.dir("hello!")
  }, 10 * 1000)
}

Provider.prototype.sendAsync = function (payload, callback) {
  log.info('payload method is ', payload.method)
  console.dir(payload)

  let method = this.methods[payload.method]
  if (method) {
    return method.call(method, payload, (err, result) => {
      if (err) {
        console.dir("====== error")
        console.dir(err)
        return callback(err)
      }
      let response = {'id': payload.id, 'jsonrpc': '2.0', 'result': result}
      console.dir("response")
      console.dir(response)
      callback(null, response)
    })
  }
  callback(new Error('unknown method ' + payload.method))
}

Provider.prototype.send = function (payload, callback) {
  this.sendAsync(payload, callback || function () {})
}

Provider.prototype.isConnected = function () {
  return true
}

Provider.prototype.on = function (type, cb) {
  executionContext.logsManager.addListener(type, cb)
}

module.exports = Provider
