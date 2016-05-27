//var timestamp = require('monotonic-timestamp')
var Notify = require('pull-notify')
var pull = require('pull-stream')
var pl = require('pull-level')

module.exports = function (db, cb) {
  var active = {}, pending = {}, queue

  var notify = Notify()

  pull(
    pl.read(db, {live: true, sync: true, keys: true, values: false}),
    pull.drain(function (key) {
      if(key.sync) return cb && cb(null, queue)
      pending[key] = true
    }, function () {})
  )

  return queue = {
    push: function (job, cb) {
      db.put(job, null, cb || noop)
    },

    //get the next unpulled job.
    pull: function (cb) {
      for(var k in pending) {
        active[k] = pending[k]
        delete pending[k]
        return k
      }
    },

    done: function (id) {
      if(active[id])
        db.del(id, function (err) {
          if(!err) {
            delete active[id]
            notify(id)
          }
        })
    },

    changes: function () {
      return notify.listen()
    }
  }
}

