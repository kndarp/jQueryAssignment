var readline        = require('readline'),
    fs              = require('fs'),
    inputFilePath   = "Crimes_-_2001_to_present_1.csv",
    theftFilePath   = "theft.json",
    assaultFilePath = "assault.json",
    fileTheft = fs.openSync(theftFilePath,"w+"),
    fileAssault = fs.openSync(assaultFilePath,"w+"),
    lineCounter,
    arTheft = [],
    arAssault = [],
    initializeArrays = function(){
      for( var i=1; i<=16; i++){
        var obTheft = {"THEFT OVER $500": 0, "THEFT $500 AND UNDER" : 0},
            obAssault = {"ARRESTED": 0, "NOT ARRESTED": 0},
            year = 2000 + i;

            obTheft.YEAR = year;
            obAssault.YEAR = year;

            arTheft.push(obTheft);
            arAssault.push(obAssault);
      }
      console.log("Arrays initialized");
    },
    reader          = fs.createReadStream(inputFilePath),
    csvConverter    = readline.createInterface({
      input   : reader
    }),
    regex             =  /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g,
    arHeader,
    iPrimType,
    iDesc,
    iArrest,
    iYear;
    // regex2           = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    // regex           = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;


//    On Opening file, add '[' to the beginning of the file and initialize file counter.
reader.on('open', function(){
    console.time("conversionTime");
    lineCounter = -1;
    initializeArrays();
  });


    //    Create JSON objects of CSV rows and write them to file.
csvConverter.on('line',function(line){


    // console.log(line);

    //  Create JSON object from CSV Row

    var rowValues = line.split(regex);
    // console.log(JSON.stringify(rowValues));
    /*  Legend for Row Values
    *
    *   rowValues[5]  - Primary Type
    *   rowValues[6]  - Description
    *   rowValues[8]  - Arrest
    *   rowValues[17] - Year
    *
    */

    //  Increment line counter and skip for header row.
    if(lineCounter++ < 0 ){
      arHeader = rowValues;
      for( var i=0; i<arHeader.length; i++){
        switch (arHeader[i]) {
          case "Primary Type":
            iPrimType = i;
            break;
          case "Description":
            iDesc = i;
            break;
          case "Arrest":
            iArrest = i;
            break;
          case "Year":
            iYear = i;
            break;

        }
      }
      return;
    }

    //  Log line count
    console.log("Reading line ",lineCounter);


    var year  = +(rowValues[iYear]);
    index = year - 2001;

    if (rowValues[iPrimType] == "THEFT" && rowValues[iDesc].indexOf('$500') != -1) {

      if(rowValues[iDesc].toUpperCase().indexOf('UNDER') != -1){
        arTheft[index]['THEFT $500 AND UNDER']++;
        // console.log("THEFT $500 AND UNDER");
      }else {
        arTheft[index]['THEFT OVER $500']++;
        // console.log("THEFT OVER $500");
      }
    }

    if (rowValues[iPrimType] == "ASSAULT") {
      if(rowValues[iArrest].toUpperCase().indexOf("TRUE") != -1){
        arAssault[index]['ARRESTED']++;
        // console.log("ASSAULT ARRESTED");
      }else {
        arAssault[index]['NOT ARRESTED']++;
        // console.log("ASSAULT NOT ARRESTED");
      }
    }

});


//    On end of input file, write objects to their respective files.
reader.on('end',function(){

    console.log("======End of Input File======");

    fs.write(fileTheft,JSON.stringify(arTheft));
    fs.write(fileAssault,JSON.stringify(arAssault));

    console.log("Total Records read : ",lineCounter);
    console.timeEnd("conversionTime");

});
