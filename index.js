var express = require("express"); //npm install express --save
//var cookieParser = require('cookie-parser');     //npm install cookie-parser --save
const ejs = require("ejs"); //npm install hbs --save
var path = require("path"); //npm install path --save
//var network = require('network');                  //npm install network --save
var fs = require("fs"); //npm install fs --save
var xml2js = require("xml2js"); //npm install xml2js --save

const parser = new xml2js.Parser({ attrkey: "ATTR" });
const PORT = 3000;
const fsPromises = fs.promises;
const sqlite = require("./js/sqlite"); //npm install sqlite3 --save
//const { constants } = require("buffer");
//const { time } = require("console");
const cssPath = path.join(__dirname, "/css");
const jsPath = path.join(__dirname, "/js");
const htmlPath = path.join(__dirname, "/html");
const imgPath = path.join(__dirname, "/images");
const viewPath = path.join(__dirname, "/views");
const xmlPath = path.join(__dirname, "/xml");

//const cXmlSteps = 'xml/stepsinvalidpath.xml'; //for testing
const cXmlSteps = "xml/steps.xml";
const cUtf8 = "utf8";
const cEmptyStr = "";
const cStatic = "/static";

var networkPath = cEmptyStr;
var app = express();

app.use(cStatic, express.static(cssPath));
app.use(cStatic, express.static(jsPath));
app.use(cStatic, express.static(htmlPath));
app.use(cStatic, express.static(imgPath));
app.use(cStatic, express.static(xmlPath));

//templates
app.set("view engine", "ejs");
app.set("views", viewPath);

app.use(express.json());

//send the main page to the browser
app.get("/", (req, res) => {
  sqlite.openDatabase(); //attempt to open the database
  res.sendFile("html/main.html", { root: __dirname });
});

//send the main page to the browser
app.get("/main", (req, res) => {
  sqlite.openDatabase(); //attempt to open the database
  res.sendFile("html/main.html", { root: __dirname });
});

//send the main page to the browser
app.get("/asteps", (req, res) => {
  //sqlite.openDatabase(); //attempt to open the database
  res.sendFile("html/admin.html", { root: __dirname });
});

//display a list of all patient information
app.get("/list", (req, res) => {
  sqlite
    .readTable("list")
    .then((rows) => {
      res.render("list", { rows: rows }, (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send(html);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//main menu, upload patient data
app.get("/upload", (req, res) => {
  //get the destination path
  networkPath = cEmptyStr;
  var con = cEmptyStr;
  var xml_string = fs.readFileSync(cXmlSteps, cUtf8);
  parser.parseString(xml_string, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      networkPath = res["steps"]["networkpath"].toString();
    }
  });
  pathExists(networkPath)
    .then((res) => {
      if (res) {
        con = true;
      } else {
        con = false;
      }
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      sqlite.readTable("list").then((clients) => {
        res.render(
          "upload",
          { row: { drive: networkPath, connect: con }, clients: clients },
          (err, html) => {
            if (err) {
              console.log(err);
            } else {
              res.send(html);
            }
          }
        );
      });
    });
});

//create the json data file then deletes the old data from database
app.get("/senddatafile", (req, res) => {
  sqlite
    .readTable("all")
    .then((rows) => {
      createJsonFile(rows, req.query.userId)
        .then((fn) => {
          res.send(fn);
          sqlite.deleteClientData();
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//creates the user table for login data
app.get("/createUsersTable", (req, res) => {
  sqlite
    .createUsersTable()
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      res.send(err);
    });
});

//creates the user table for login data
app.get("/deleteUsersTable", (req, res) => {
  sqlite
    .deleteUsersTable()
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/usersexists", (req, res) => {
  sqlite
    .usersTableExists()
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      res.send(err);
    });
});

//login request
app.post("/login", (req, res) => {
  sqlite
    .readUser(req.body.usr, req.body.pwd)
    .then((text) => {
      res.send(JSON.stringify({ message: text }));
    })
    .catch((text) => {
      res.send(JSON.stringify({ message: "login failure" }));
    });
});

//retrieves the user by id and displays the user page
app.post("/edituser", (req, res) => {
  sqlite
    .readUserById(req.body.id)
    .then((row) => {
      res.render("user", { row: row }, (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send(html);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//save current user data (add or edit)
app.post("/saveuser", (req, res) => {
  if (req.body.id != "0") {
    //edit user
    sqlite.updateUser(req).then((text) => {
      if (text == "success") {
        res.send(text);
      }
    });
  } else {
    //add user
    sqlite.insertUser(req).then((text) => {
      if (text == "success") {
        res.send(text);
      }
    });
  }
});

app.post("/deleteuser", (req, res) => {
  sqlite
    .deleteUserById(req.body.id)
    .then((text) => {
      if (text == "delete successful") {
        sqlite
          .readUsers()
          .then((rows) => {
            res.render("userslist", { rows: rows }, (err, html) => {
              res.send(html);
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

//display a list of all patient information
app.get("/userslist", (req, res) => {
  sqlite
    .readUsers()
    .then((rows) => {
      res.render("userslist", { rows: rows });
    })
    .catch((err) => {
      console.log(err);
    });
});

//sends the entry page to the browser for a new client (id=0, mode=add)
app.get("/entry", (req, res) => {
  res.render("entry", { row: { ID: req.query.id }, mode: "add" });
});

//sends the login page to the browser
app.get("/login", (req, res) => {
  res.sendFile("html/login.html", { root: __dirname });
});

//save patient data (from entry page)
app.post("/save", (req, res) => {
  if (req.body.mode == "edit") {
    sqlite.updateClient(req);
  } else {
    //add new client
    sqlite.writeClient(req);
  }
});

//get the client by id and return to the entry page
app.get("/edit", (req, res) => {
  sqlite
    .readClient(req.query.id)
    .then((row) => {
      res.render("entry", { row: row, mode: "edit" }, (err, html) => {
        if (err) {
          console.log(err);
        } else {
          res.send(html);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//starts the node server
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server listening on PORT", PORT);
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});

//true if the director path exists, otherwise false
async function pathExists(path) {
  var res = true;
  try {
    await fsPromises.access(path);
  } catch (e) {
    res = false;
  }
  return res;
}

//var buildUsersList = () => {
//  sqlite
//    .readUsers()
//    .then((rows) => {
//      res.render("userslist", { rows: rows }, (err, html) => {
//        if (err) {
//          console.log(err);
//        } else {
//          res.send(html);
//        }
//      });
//    })
//    .catch((err) => {
//      console.log(err);
//    });
//};

//creates a file containing all the client data in json array format
var createJsonFile = (row, userId) => {
  // file name 'stepsmmddyyyyhhmmloginname.json'
  const dt = new Date();
  const fn = networkPath.concat(
    "steps",
    dt.getFullYear().toString(),
    String(dt.getMonth() + 1).padStart(2, "0"),
    String(dt.getDay() + 1).padStart(2, "0"),
    String(dt.getHours()).padStart(2, "0"),
    String(dt.getMinutes()).padStart(2, "0"),
    String(dt.getSeconds()).padStart(2, "0"),
    userId,
    ".json"
  );
  var getData = () => {
    return new Promise((resolve, reject) => {
      fs.writeFile(fn, JSON.stringify(row), (err) => {
        if (err) {
          console.log(err);
          return "error";
        } else {
          resolve(fn); //return the actual file name
        }
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};
