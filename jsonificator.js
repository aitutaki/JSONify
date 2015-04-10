var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('datafile.csv');
var fs = require('fs');

var lineNo = 0;
var lineData = [];
var columns = [];

var file = fs.createWriteStream('output.json');
file.write("[");
file.on('error', function(err) {
  /* error handling */
  console.log ("Unable to write to file.");
});

function processFieldValue (obj, property, value) {
  var isNum = false;
  /*
  if (property.indexOf("*") > -1)
  {
    isNum = true;
    property = property.replace("*", "");
  }
  */

  if (isNum)
  {
    obj[property] = Number(value);
  }
  else
  {
    if (value == "TRUE" || value == "FALSE")
    {
      obj[property] = value.toLowerCase();
    }
    else if (value == "NULL" || value == "null") {
      obj[property] = "";
    }
    else
    {
      obj[property] = value;
    }
  }

}

lr.on('error', function (err) {
    // 'err' contains error object
});

lr.on('line', function (line) {
    var o = {};
    var col = "";
    var val = "";
    var props = null;
    var array = "";
    var prop = "";
    var json = "";

    debugger;

    // 'line' contains the current line without the trailing newline character.
    if (lineNo == 0)
    {
      columns = line.split(",");
    }
    else
    {
      lineData = line.split(",");
    }
    for (var i=0; i < lineData.length; i++) {
      col = columns[i];
      val = lineData[i];

      // Check if this is an array property first
      if (col.indexOf("[") > -1)
      {
        props = col.split("[");
        array = props[0];
        prop = props[1].replace("]", "");

        o[array] = o[array] || [{}];
        var obj = o[array][0];
        //var obj = o[prop][0] || [{}][0];
        if (!obj) throw "Unable to get array object"

        processFieldValue (obj, prop, val);
      }
      else if (col.indexOf(".") > -1) {
        props = col.split(".");
        array = props[0];
        prop = props[1];

        o[array] = o[array] || {};

        processFieldValue (o[array], prop, val);
      }
      else
      {
        processFieldValue (o, col, val);
      }

    }

    if (lineNo > 0)
    {
      try
      {
        json = JSON.stringify(o);
        json += "\n";
        if (lineNo > 1) json = "," + json;
      }
      catch(e)
      {
        console.log("Unable to serialise line " + lineNo);
      }
      finally
      {
        console.log ("Writing line to json file " + json);
        file.write(json);
      }
    }
    lineNo++;
});

lr.on('end', function () {
  // All lines are read, file is closed now.
  file.write("]");
  file.end();
  console.log("EOF");
});
