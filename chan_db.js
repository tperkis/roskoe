    /*
      chan_db.js – basic js object-based channel data base for use with roskoe osc pubsub server.
          tperkis 2012-08-28.
          
      In future, perhaps replace with version using redis backend?
          
      Store records corresponding to each created channel. 
      Channel records are stored in assoc array data[] keyed by an osc address. Content of each record is an 
      object:
        pwd :  write password for ch messages, = '' if none defined.
        subs : array of subscriber records. Each subscriber is an object with
                    ip: ip address msg should be forwarded to.
                    port: port of same.
                    subID: subscriber ID.
                    cretime: date sub was created.
        cretime: channel creation time. (getTime(), millisecs in unix epoch)
        atime: time of last message sent (as above)
        
      For now no security, accounts, registration of subscribers. 
      
     */
    trp = require('./trp_utils');
    var backupFilename = "./chan_db.json";
    var backupRate = 60 * 5; // default backup every n seconds.
          
    exports.data = []; // exports
    
    var toType = function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    }
    
    var ts = function(){ 
        return (new Date()).getTime(); 
    }
    
    exports.clear = function() {
        this.data = [];
    }
    
    exports.loadFromFile = function(filename){
        if(trp.toType(filename) === 'undefined' || filename === ''){
            filename = this.backupFilename;
        }
        //  NIY
    }
    
    exports.setBackupRate = function(rateSecs){
        this.backupRate = rateSecs;
        // NIY: set interval timer to do periodic backups.
    }
    
    exports.get = function(addr) {
        if(toType(this.data[addr]) !== 'undefined'){
            return this.data[addr];
        } else {
            return {};
        }
    }
    
    exports.chanExists = function(addr){
        return (toType(this.data[addr]) !== 'undefined');
    }
    
    exports.add = function(addr,pwd){
       if(toType(this.data[addr]) === 'undefined'){ 
           var t = ts();
           this.data[addr] = { 'pwd' : pwd, 'subs' : [], 'cretime' : t, 'atime' : t }
           return [1, 'success: channel ' + addr + ':' + pwd + ' added'];
       } else {
           return [0, 'failed: channel already exists'];
       }
    }
    
    exports.addSub = function(addr,ip,port){
      if(toType(this.data[addr]) !== 'undefined' &&
         this.data[addr].subs[ip + ':' + port] === undefined){
          // channel exists, and this ip+port not already subscribed: add subscriber. 
            this.data[addr].subs[ip + ':' + port] =  {
              'ip' : ip,
              'port' : port,
              'cretime' : ts() };
            return [1, 'success new subscriber ' + ip + ':' + port + ' added'];
       } else {
          return [0, ['failed:']];
          }
    }
    
    //  is given password the right one for the given channel address? 
    //   return [1, "msg..."] or [0, "..."]
    exports.checkPassword = function(addr,pwd) {
        var channelRecord = this.get(addr);
         if( channelRecord === {}){
            return [-1, "error: channel doesn't exist"]
        } else {
            if(pwd === channelRecord.pwd){
                return [1, 'pwd ok'];
            } else {
                return [0, 'bad pwd'];
            }
        }
    }
    
    // return n of currently defined channel records.
    exports.nChannels = function(){
        return Object.keys(this.data).length;
    }
    
    // return n of subscribers to the given channel.
    
    exports.nSubs = function(addr){
        var nSubs;
        if(toType(this.data[addr]) !== 'undefined'){ 
          nSubs = Object.keys(this.get(addr).subs).length;
        } else {
            nSubs = 0;
        }
        return nSubs;
    }
    
    exports.reapChannels = function(olderThan) {
        var key;
        for(key in this.data) {
            if(this.data[key].atime < olderThan){
                delete this.data[key];
                console.log("unused channel ", key, " deleted.");
            }
        }
    }
