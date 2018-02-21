


// ran npm install --save crypto-js
sha256 = require('crypto-js/sha256')

sLineDivider = "\r\n"
sBlockDivider = "---------------------------------------------\r\n"

// simple implementation of blockchain
//
//  BlockChain:
//     block #1 - Genesis block - data, timestamp, hash, hashPrevious
//     block #n - data, timestamp, hash, hashPrevious
//  
class Block {

    constructor(data, tStamp, hashPrev, difficulty, nonce, isBlank ) {
        this.data = data
        this.timeStamp = tStamp
        this.hashPrev = hashPrev
        this.nonce = nonce  // updated when mined
        if( !isBlank )
            this.mineHash( difficulty ) // requires # of leading zeros in hash
        else
            this.hash = 0
        this.next = null // link to next block in the chain
    } // end of constructor

    toString() {
        return "data: " + JSON.stringify(this.data) + "\n" +
            "timeStamp: " + this.timeStamp + "\n" +
            "hash: " + this.hash + "\n" +
            "hashPrev: " + this.hashPrev + "\n"
    }

    toDataString() {
        // return a representation of a block that can be stored and retrieved 
        return( JSON.stringify(this.data) + sLineDivider
            + this.timeStamp + sLineDivider
            + this.hashPrev + sLineDivider 
            + this.nonce + sLineDivider
            + this.hash + sLineDivider
            + sBlockDivider )
    }

    dataToString() {
        var str = ""
        for( var key in this.data )
            str += key + ":" + this.data[key] + "\t"
        return str + "\r\n"
    }

    // simple hash of data in this block
    hashCalc() {
        var hash = sha256(JSON.stringify(this.data) +
            this.timeStamp + this.hashPrev + this.nonce).toString()
        // console.log( this.nonce + ":" + hash )
        return hash
    }

    // this is a difficult block to hash depends on difficulty setting
    mineHash( difficulty ) {
        this.hash = this.hashCalc()

        // keep adjusting data until has contains difficulty leading 0's

        // this copied from web example, but comparison fails me here
        //while( this.hash.substring(0,difficulty) !==  
        //    Array(difficulty).join("0").toString())  {
           while ( !isLeading(this.hash,"0", difficulty )) {
                //console.log("hash: " + this.hash.substring(0,difficulty) 
                //    + " : " + Array(difficulty + 1).join("0") );

                this.nonce++
                this.hash = this.hashCalc()
            }
        return this.hash
    }

}   // end of block class



class BlockChain {

    // Genesis block - previous hash === 0 
    constructor(data, tStamp) {
        this.difficulty = 2
        this.head = new Block(data, tStamp, 0, this.difficulty, 0, false)

    }


    // add items to this chain
    // if tStamp is empty, treat data as a new block
    push(data, tStamp) {
        console.log("push2: " + data + " " + tStamp )
                // traverse to the end of the chain (linked-list)
        var blk = this.head
        while (null != blk.next)
            blk = blk.next
          // blk is now the last link in the chain
         
        if( "" != tStamp )
        // add a new link to the end of the chain
            blk.next = new Block(data, tStamp, blk.hash, this.difficulty, 0, false)
        else
            blk.next = data;
    }

    toString() {
        var blk = this.head
        var str = ""
        while (null != blk) {
            str += blk.toString() + "\n"
            blk = blk.next
        }
        return str  // string rep of all data in blockchain
    }


    ledgerToString() {
        // list ledger of transactions
        var blk = this.head
        var str = ""
        while( null != blk) {
            str += blk.dataToString()
            blk = blk.next
        }
        return str
    }

    isValid() {
        // verify for every link
        //  hashPrev === prev.hash
        // calculate/verify has for each block
        var blk = this.head
        while (null != blk) {

            // another way to compare values? from web 
            //if (Object.is(blk.hash, blk.hashCalc()))
            //    return false

            // verify own hash
            if (("" + blk.hash) != ("" + blk.hashCalc())) {
                console.log("" + blk.hash)
                console.log("" + blk.hashCalc())
                return false
            }
            if (null != blk.next)
                if (blk.hash != blk.next.hashPrev)
                    return false
            blk = blk.next
        }
        return true
    }
}   // end of blockchain




function isLeading( str, c, n ) {
    // return true if string str has n leading chars c

    // check n leading chars, return false if not matching
    for( var i=0; i<n; i++ )
        if( c != str.substring(i,i+1) )  // not matching?
            return false

    return true
}


function chainStore( filename, chain ) {
    // store the complete block chain to file
    // psuedocode:
    //    open/create the file for writing
    //    store the block information in a way that can be retrieved later
    //    consider some encryption in case we are storing sensitive information

    // open the file:
    var filePath = "./filename"
    var fs = require('fs')

    // open file for writing and write out header line
    fs.writeFileSync( filename, "#----- blockchain data -------" 
        + sLineDivider + sBlockDivider )

        // loop to traverse the chain, saving data along the way
        var blk = myChain.head
        while( null != blk ) {

            fs.appendFileSync(filename, blk.toDataString())
           blk = blk.next
        }

}  // end of chainStore()


function chainRetrieve( filename ) {

    var newChain = null

    // retrieve data from file into a new blockchain
    //   read data from file
    var fs = require('fs')
    /* fs.readFile( filename, function(err, data) {
        if( err ) throw err
        console.log("data has been read!")
        console.log(data)
    } )
      returns buffer with unknown content 
      */
     var textData = fs.readFileSync(filename, 'utf8')
// your work:  
// find out how to split this data buffer into
// separate blocks
     var aBlocks = textData.split(sBlockDivider)

     var sBlk = ""
     // skip the first data file header section (start at 1 not 0)
 
     for( var i=1; i<aBlocks.length; i++  ) {
         sBlk = aBlocks[i]
         var aData = sBlk.split(sLineDivider) 
         var blk = null
 
         if( 5 <= aData.length ) {

            // skip block of bad data
            if( 1 == i)
                newChain = new BlockChain( JSON.parse(aData[0]), aData[1])
            else {
                blk = new Block(JSON.parse(aData[0]), aData[1], aData[2], 0, aData[3], true )
                blk.hash = aData[4]
                newChain.push( blk, "" )  // push new block into chain
                console.log( "read:\n" + blk.hash + "\n" + blk.hashCalc() + "\n" )
            }


         }


     }
// hint - see how it was written to file - 
//   what separates blocks, lines?
  
    //   split into separate blocks of data
    //   create blocks from data
    //   verify that it is a valid blockchain

     return newChain

}  // end of chainRetrieve()



console.log( isLeading( "00abc", "0", 2 ))
console.log( isLeading( "00abc", "0", 3 ))

// process.exit(1)


// create a simple block just for testing
blk1 = new Block({
    name: 'firstBlock'
}, Date(), 0, 2,0,false)


// create a blockChain
myChain = new BlockChain({
    name: 'manningChain'
}, Date())

// add some data to my blockchain
myChain.push({
    sender: 'Luke',
    reciever: 'Arthur',
    amount: '1000'
}, Date())

myChain.push({
    sender: 'Dan',
    reciever: 'Luke',
    amount: '1000'
}, Date())
myChain.push({
    sender: 'Maddie',
    reciever: 'Sharon',
    amount: '1000'
}, Date())

console.log(myChain.toString())

console.log("Valid? " + myChain.isValid())

// *****************  saving data to file
// chainStore( "chainDB.txt", myChain )

// ***************** read data into chain
myChain2 = chainRetrieve("chainDB.txt")

console.log("Chain2 Valid? " + myChain2.isValid())
console.log("Chain2:" + myChain2.toString())


console.log("Chain2 ledger:\n" + myChain2.ledgerToString())

console.log("Chain1 ledger:\n" + myChain.ledgerToString())
