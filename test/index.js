var tape = require('tape')
var path = require('path')

var pull = require('pull-stream')
var rimraf = require('rimraf')
var level = require('level')
var tmp = require('osenv').tmpdir()

var LDQ = require('../')

tape('simple', function (t) {
  var dir = path.join(tmp, 'test-level-durable-queue')
  rimraf.sync(dir)

  var db = level(dir)

  var ldq = LDQ(db, function () {

    ldq.push('foo', function () {
      t.equal(ldq.pull(), 'foo')
      //does not return the same thing twice.
      t.equal(ldq.pull(), undefined)
      ldq.done('foo')
    })

    pull(ldq.changes(), pull.drain(function (foo) {
      t.equal(foo, 'foo')
      t.end()
    }))
  })

})

