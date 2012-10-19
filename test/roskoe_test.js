var roskoe = require('../roskoe.js'),
    osc    = require('node-osc'),
    assert = require('assert');
    
describe("roskoe main", function() {
    before(function() {
        roskoe.go();
    });
    describe('stripOscAddressPassword', function() {
        it('should work with password',function() {
            var rv = roskoe.stripOscAddressPassword("foo:bar/blah/blah/blah");
            assert.equal(1,1,
                "dummy test 1 = 1");
            assert.deepEqual(['foo','bar','foo/blah/blah/blah'], [rv.chanAddr, rv.chanPwd, rv.oscAddr], 
                        "stripOscAddressPassword with password present");
        });
        it('should work without password',function() {
            var rv = roskoe.stripOscAddressPassword("foo/blah/blah/blah");
            assert.deepEqual(['foo','','foo/blah/blah/blah'], [rv.chanAddr, rv.chanPwd, rv.oscAddr], 
                        "stripOscAddressPassword without password present");
        });
   });

    describe('OSC Forwarding',function() {
       it('should forward to subs', function() {
          // test osc traffic.
         var c = new osc.Client('127.0.0.1', 3333);
         var s1 = new osc.Server(9998, '127.0.0.1');
         var s1Cnt = 0;
         s1.on("message", function (msg, rinfo) {
             console.log("*** s1 127.0.0.1:9998  rcvd: ", msg);
             s1Cnt += 1;
             if(s1Cnt === 2) {
                 assert.equal(s1Cnt, 2, "2 msgs received through forwarding");
                 done();
             } else {
                 assert.equal(s1Cnt,1, "1 msg received...")
             }
         });
     
         c.send('roskoe/add', 'foo', 'bar');
         c.send('roskoe/sub', 'foo', '127.0.0.1', 9998);
              
         c.send('foo:bar',"message to 9998");
         c.send('foo:bar', "message to 9998 AND 9999");
        });
    });
    
});
     
