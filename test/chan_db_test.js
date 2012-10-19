// mocha bdd style tests. 
// run with "mocha"

var chanDB = require('../chan_db'),
    util = require('util'),
    assert = require('assert');

var rv, ch;

//=======================================================================
describe("chanDB", function() {
    beforeEach( function() {
        chanDB.clear();
    });
    
    it('should add channels', function() {
        rv = chanDB.add('channel_foo', 'foo_pwd');
        assert.equal(rv[0], 1, "successful channel add");
        assert.equal(chanDB.nChannels(), 1, "one channel");
        rv = chanDB.add('channel_foo2', 'foo2_pwd');
        assert.equal(chanDB.nChannels(), 2, "two channels");
           
    });
 
    it('should check passwords', function() {
        rv = chanDB.add('channel_foo', 'foo_pwd');
        assert.equal(rv[0], 1, "successful channel add");
        
        ch = chanDB.get('channel_foo');
        assert.equal(ch.pwd, 'foo_pwd', "proper password returned");

        rv = chanDB.checkPassword('channel_foo', 'foo_pwd');
        assert.equal(rv[0],1, "correct password check");

        rv = chanDB.checkPassword('channel_foo', 'goo_pwd');
        assert.equal(rv[0],0, "bad password check");
        
    });
    
    it('should block duplicate channel adds', function() {
        rv = chanDB.add('channel_foo', 'foo_pwd');
        assert.equal(rv[0], 1, "successful channel add");
    
        rv = chanDB.add('channel_foo', 'foo_pwd');
        assert.equal(rv[0], 0, "disallow duplicate channel add.");       
        
    });
    
    it('should clear properly', function() {
        rv = chanDB.add('channel_foo', 'foo_pwd');
        assert.equal(chanDB.nChannels(), 1, "one channel");
        rv = chanDB.add('channel_foo2', 'foo2_pwd');
        assert.equal(chanDB.nChannels(), 2, "one channel");
        chanDB.clear();
        assert.equal(chanDB.nChannels(), 0, "no channel");
    });
});

// 
// rv = chanDB.add('chan_bar', '');
// assert.equal(chanDB.nChannels(), 2, "two added channels");
// 
// rv = chanDB.addSub('channel_foo', '127.0.0.1', 8888);
// assert.equal(rv[0], 1, "added sub");
// rv = chanDB.addSub('channel_foo', '127.0.0.1', 9999);
// assert.equal(rv[0], 1, "added sub");
// 
// rv = chanDB.nSubs('channel_foo');
// assert.equal(rv,2, "sub count for chan w 2 subs")
// 
// rv = chanDB.nSubs('chan_bar');
// assert.equal(rv,0, "sub count for zero subs")
// 
// rv = chanDB.nSubs('non_existent_channel');
// assert.equal(rv,0, "sub count zero for non_existent channel")
// 
// rv = chanDB.chanExists('channel_foo');
// assert.equal(rv,true, "chanExists for channel that does exist");
// 
// rv = chanDB.chanExists('non_existent_channel');
// assert.equal(rv,false, "chanExists for non-existent channel");

// console.log('\n', util.inspect(chanDB.data, true, null), '\n');
