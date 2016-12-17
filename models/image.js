var express = require("express");
var app = express();

var fs = require("fs");

var multer = require("multer");
var upload = multer({dest: "./uploads"});

var mongoose = require("mongoose");

var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

  //second parameter is multer middleware.
module.exports.UploadImage = function(req, res, callback){
    gfs = Grid(conn.db);
    //upload.single("avatar");
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    var writestream = gfs.createWriteStream({
      filename: req.file.originalname
    });
    //
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
      .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, callback)})
        .on("err", function(){res.send("Error uploading image")})
          .pipe(writestream);
  };

  // sends the image we saved by filename.


module.exports.GetAllImages = function(callback) {
         conn.db.collection('fs.files', function(err, collection) {
             collection.find().toArray(function(err, items) {
                 callback(null,items);
             });
         });
}

module.exports.GetImage = function(req, res){
      gfs = Grid(conn.db);
      var readstream = gfs.createReadStream({filename: req.params.filename});
      readstream.on("error", function(err){
        res.send("No image found with that title");
      });
      readstream.pipe(res);
}

  //delete the image
module.exports.DeleteImage= function(req, res){
    gfs.exist({filename: req.params.filename}, function(err, found){
      if(err) return res.send("Error occured");
      if(found){
        gfs.remove({filename: req.params.filename}, function(err){
          if(err) return res.send("Error occured");
          res.send("Image deleted!");
        });
      } else{
        res.send("No image found with that title");
      }
    });
  };