var osc = require('node-osc'),
    chanDB = require('./chan_db'),
    util = require('util'),
    trp = require('./trp_utils');
    
// given an oscAddress with possible chan:pwd pattern at start, return array with
//  [channelAddress, channelPassword, <oscAddress_stripped_of_channelPassword> ]
//
exports.stripOscAddressPassword = function(oscAddress){
    var channelPwd = '';
    var addrParts = oscAddress.split('/');
    var channelAddress = addrParts[0];
    var apw = channelAddress.split(':');
    if(trp.toType(apw[1]) != 'undefined'){
        channelAddress = apw[0];
        channelPwd = apw[1];
        addrParts[0]= channelAddress;
        oscAddress = addrParts.join('/');
    }
    return { 'chanAddr': channelAddress, 'chanPwd':channelPwd, 'oscAddr': oscAddress};
}

exports.go = function() {
    console.log("\nRoskoe 0.1\n");

    chanDB.loadFromFile();
    chanDB.setBackupRate(10 * 60); 

    var oscServer = new osc.Server(3333, '0.0.0.0');
    oscServer.on("message", function (msg, rinfo) {
        var rv,i,pwd_in;
        //console.log(">>>>ROSKOE rcvd ", msg);
        switch(msg[0]) {
        
            case 'roskoe/add':
                //  cmd message to roskoe via OSC: add a channel.
                //console.log("roskoe/add");
                pwd_in = (trp.toType(msg[2]) === 'string') ? msg[2] : '';
                rv = chanDB.add(msg[1], pwd_in);
                //console.log( (rv[0] == 1) ? "added channel" : "add channel failed");
                //console.log('\n', util.inspect(chanDB.data, false, null), '\n');
                break;
            
            case 'roskoe/sub':
                // cmd message to roskoe: add a new subscription.
                //console.log('roskoe/sub');
                rv = chanDB.addSub(msg[1], msg[2],msg[3]);
                //console.log( (rv[0] == 1) ? "added subscription" : "add sub failed");
                //console.log('\n', util.inspect(chanDB.data, false, null), '\n');
                break;
            
            default:  
                // all other messages will be routed.
                // process incoming message address.
                var x = this.stripOscAddressPassword(msg.shift());
 
                // make a new output msg with the munged address (password removed).
                var outMsg = new osc.Message(x.oscAddr);
                for(i = 0;  i < msg.length; i++){
                    outMsg.append(msg[i]);
                }
                // console.log('msg', util.inspect(msg,false,null));
                // console.log("outmsg:", util.inspect(outMsg,false,null),'\n');

                // get channel info and fwd to subscribers if all is kosher.
                var chan = chanDB.get(x.chanAddr);
                var nsubs;
                //console.log("chan", util.inspect(chan, true,null));
                if(chan !== {} && chan.pwd === x.chanPwd && (nsubs = chanDB.nSubs(x.chanAddr)) > 0) { 
                     var oscClients = Array(nsubs);
                     for(key in chan.subs) {
                           oscClients[i] = new osc.Client(chan.subs[key].ip, chan.subs[key].port);
                           oscClients[i].send(outMsg); 
                           //console.log("sent to", chan.subs[key].ip, chan.subs[key].port, x.oscAddr,msg)
                     }
                 } else {
                     console.log("missing channel, bad pwd or no subs", util.inspect(chan,false,null));
                 }
                 oscClients = null; // not sure if this is necessary, or even desirable.
             
        } // switch
     }); // oscServer.on()
}  // go()

if(require.main ===  module){
    this.go();
}
 
