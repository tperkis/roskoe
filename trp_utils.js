exports.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}


// Crude! – test can compare simple string, numerical or non-assoc arrays (holding strings or numbers) ONLY.
exports.test = function(a,b, msg) { 
        var tv;
        if(this.toType(a) === 'array' && this.toType(b) === 'array'){
            a = a.toString();
            b = b.toString();
        }
        var tv = ( (a) === (b) );
        if(tv){
            console.log((tv ? 'PASS  ' : 'FAIL ******************** '), msg, [a, b]);          
        }
         return tv;
    }

exports.ts = function(){ 
    return (new Date()).getTime();
}

