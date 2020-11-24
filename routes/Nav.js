const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const fs = require("fs");

const dirImage = path.join(__dirname, "../public");

let imageSchema = new mongoose.Schema({
  imgUrl: String,
});

let picture = mongoose.model("Picture", imageSchema);

router.get("/", (req, res) => {
  picture.find({}).then((images) => {
    res.render("index", { images: images });
  });
});

router.get("/upload/image", (req, res) => {
  res.render("upload");
});

//Set Image Storage
let storage = multer.diskStorage({
  destination: "./public/upload/images/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Please Images Only");
  }
}

router.post("/upload-single/image/", upload.single("singleimage"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    return console.log("Please select an image");
  }

  let url = file.path.replace("public", "");

  picture
    .findOne({ imgUrl: url })
    .then(async (img) => {
      if (img) {
        console.log("duplicate Image, Try Again");
        return res.redirect("/upload/image");
      }
      await picture.create({ imgUrl: url }).then((img) => {
        console.log("Image Saved successfully");
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log("ERROR " + err);
    });

  res.redirect("/");
});

router.post("/upload-multiple/images", upload.array("mutlipleimages"), (req, res, next) => {
  const files = req.files;
  if (!files) {
    return console.log("Please Select an image");
  }

  files.forEach((file) => {
    let url = file.path.replace("public", "");

    picture
      .findOne({ imgUrl: url })
      .then(async (img) => {
        if (img) {
          return console.log("Duplicate Image");
        }
        await picture.create({ imgUrl: url });
      })
      .catch((err) => {
        console.log("ERROR: " + err);
      });
  });
  res.redirect("/");
});

router.delete("/delete/:id", (req, res) => {
  let searchQuery = { _id: req.params.id };

  picture
    .findOne(searchQuery)
    .then((img) => {
      //delete the picture from folder and also from dbs
      fs.unlink(dirImage + img.imgUrl, (err) => {
        if (err) return console.log(err);
        picture.deleteOne(searchQuery).then((img) => {
          console.log("Image delete successfully");
          res.redirect("/");
        });
      });
    })
    .catch((err) => {
      console.log("ERROR: " + err);
    });
});

module.exports = router;
