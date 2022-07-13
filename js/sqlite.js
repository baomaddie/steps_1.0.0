//const { json } = require('express/lib/response');

var sqlite = require("sqlite3").verbose(); //sqlite must be installed in windows or exist in IOS
var CryptoJS = require("crypto-js");
const dbname = "data/steps.db";

const key = "abc123"; //temporary

var encrypt = (s) => {
  var result = CryptoJS.AES.encrypt(s, key).toString();
  return result;
};

var decrypt = (s) => {
  var bytes = CryptoJS.AES.decrypt(s, key);
  var result = bytes.toString(CryptoJS.enc.Utf8);
  return result;
};

var openDatabase = () => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
      db.close();
      createDatabase();
    } else if (err) {
      logError("openDatabase ", err);
    }
    db.close();
  });
};

var createDatabase = () => {
  var db = new sqlite.Database(dbname, (err) => {
    if (err) {
      logError("createDatabase ", err);
    } else {
      createTables(db);
    }
    db.close();
  });
};

var createUsersTable = () => {
  var sql =
    "create table users (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ";
  sql = sql + "username text not null, password text not null)";
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(sql, (err) => {
          if (err) {
            console.log(err);
            reject("failed");
          } else {
            resolve("success");
          }
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

var deleteUsersTable = () => {
  var sql = "DROP TABLE users";
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(sql, (err) => {
          if (err) {
            console.log(err);
            reject("failed");
          } else {
            resolve("success");
          }
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

var usersTableExists = () => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          "select name from sqlite_master where type='table' and name='users'",
          (err, row) => {
            if (err) {
              reject(err.message);
            } else {
              if (row) {
                resolve("true");
              } else {
                resolve("false");
              }
            }
          }
        );
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//--------------------------------------------
var createTables = (db) => {
  //will build the client table
  var s =
    "create table client (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "; //id

  for (var i = 1; i <= 13; i++) {
    //text fields
    s = s + "t" + i + " text ";
    if (i < 3) {
      s = s + " not null, "; //t1 and t2 are required, first name/last name
    } else {
      s = s + " , ";
    }
  }

  for (i = 1; i <= 2; i++) {
    //date fields
    s = s + "d" + i + " text, ";
  }

  s = s + "p1 text, ";

  for (i = 1; i <= 55; i++) {
    //radio buttons
    s = s + "r" + i + " text, ";
  }

  for (i = 1; i <= 21; i++) {
    //checkboxes
    s = s + "c" + i + " text, ";
  }

  s = s + "s1 text, "; //state dropdown list

  for (i = 2; i <= 5; i++) {
    //dropdown lists
    for (var j = 0; j <= 3; j++) {
      s = s + "s" + i.toString() + j.toString() + " text, ";
    }
  }

  s = s + "cv1 blob )";

  db.exec(s, (err) => {
    if (err) {
      logError("createTables ", err);
    } else {
    }
  });
};

var updateClient = (req) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE, (err) => {
    if (err) {
      logError("sqlite: updateClient(): db.open ", err);
    } else {
      var s = "UPDATE client set ";
      var id = "";
      for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          var item = req.body[key];
          if (key == "id") {
            id = item;
          } else {
            if (key != "mode") {
              if (key == "cv1") {
                s = s + key + '="' + item + '"';
              } else {
                switch (key) {
                  case key.match("t"):
                  case key.match("d"):
                  case "p1":
                  case "s1":
                    s = s + key + '="' + encrypt(item) + '", ';
                    break;
                  default:
                    s = s + key + '="' + item + '", ';
                }
              }
            }
          }
        }
      }
      s = s + " WHERE id = " + id;
      db.run(s, (err) => {
        if (err) {
          logError("updateClient db.run(update) ", err);
        } else {
        }
      });
    }
    db.close();
  });
};

//update user by ID to users table
var updateUser = (req) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        var sql = "UPDATE users set ";
        var usr = 'username = "' + req.body["username"] + '", ';
        var pwd = 'password = "' + encrypt(req.body["password"]) + '" ';
        var id = "WHERE ID = " + req.body["id"];
        sql = sql + usr + pwd + id;
        db.run(sql, (err) => {
          if (err) {
            reject("failed");
          } else {
            resolve("success");
          }
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//insert new user to users table
var insertUser = (req) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        var sql = "INSERT INTO users (username, password) Values(?,?)";
        db.run(
          sql,
          [req.body["username"], encrypt(req.body["password"])],
          (err) => {
            if (err) {
              reject("failed");
            } else {
              resolve("success");
            }
          }
        );
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//searches the users table for the username/password. if found then returns 'found', otherwise returns 'not found'
//password must be decrypted. this is for the login page
var readUser = (usr, pwd) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          'select * from users where username="' + usr + '" ',
          (err, row) => {
            if (err) {
              reject(err.message);
            } else {
              if (row) {
                if (decrypt(row.password) == pwd) {
                  resolve("found");
                } else {
                  resolve("not found");
                }
              } else {
                resolve("not found");
              }
            }
          }
        );
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//reads and returns all users, password is decrypted
var readUsers = () => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all("select * from users", (err, rows) => {
          if (err) {
            reject(err);
          } else {
            Array.from(rows).forEach((row) => {
              row["password"] = decrypt(row["password"]); //decrypt password
            });
          }
          resolve(rows);
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//finds and returns the user with desired ID
//password must be decrypted
var readUserById = (id) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      if (id == 0) {
        var row = {};
        row["ID"] = id;
        row["username"] = "";
        row["password"] = "";
        resolve(row);
      } else {
        db.serialize(() => {
          db.get('select * from users where ID="' + id + '" ', (err, row) => {
            if (err) {
              reject(err);
            } else {
              row.password = decrypt(row.password);
              resolve(row);
            }
          });
        });
      }
      db.close();
    });
  };
  return getData().then((value) => {
    return value;
  });
};

//deletes the user by ID
var deleteUserById = (id) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get('delete from users where ID="' + id + '" ', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve("delete successful");
          }
        });
      });
      db.close();
    });
  };
  return getData().then((value) => {
    return value;
  });
};

var writeClient = (req) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE, (err) => {
    if (err) {
      logError("sqlite: writeClient(): db.open ", err);
    } else {
      const row = req.body;
      var s = "INSERT INTO client (";

      for (var i = 1; i <= 13; i++) {
        //text fields
        s = s + "t" + i + ", ";
      }

      for (i = 1; i <= 2; i++) {
        //text fields
        s = s + "d" + i + ", ";
      }

      s = s + "p1, "; //text field

      for (i = 1; i <= 55; i++) {
        //radio buttons
        s = s + "r" + i + ", ";
      }

      for (i = 1; i <= 21; i++) {
        //checkboxes
        s = s + "c" + i + ", ";
      }

      s = s + "s1, "; //state dropdown list

      for (i = 2; i <= 5; i++) {
        // dropdown lists
        for (var j = 0; j <= 3; j++) {
          s = s + "s" + i.toString() + j.toString() + ", ";
        }
      }

      s = s + "cv1 "; //signature

      s = s + ") Values(";

      for (i = 1; i <= 109; i++) {
        s = s + "?,";
      }
      s = s + "?)";

      db.run(
        s,
        [
          encrypt(row.t1),
          encrypt(row.t2),
          encrypt(row.t3),
          encrypt(row.t4),
          encrypt(row.t5),
          encrypt(row.t6),
          encrypt(row.t7),
          encrypt(row.t8),
          encrypt(row.t9),
          encrypt(row.t10),
          encrypt(row.t11),
          encrypt(row.t12),
          encrypt(row.t13),
          encrypt(row.d1),
          encrypt(row.d2),
          encrypt(row.p1),
          row.r1,
          row.r2,
          row.r3,
          row.r4,
          row.r5,
          row.r6,
          row.r7,
          row.r8,
          row.r9,
          row.r10,
          row.r11,
          row.r12,
          row.r13,
          row.r14,
          row.r15,
          row.r16,
          row.r17,
          row.r18,
          row.r19,
          row.r20,
          row.r21,
          row.r22,
          row.r23,
          row.r24,
          row.r25,
          row.r26,
          row.r27,
          row.r28,
          row.r29,
          row.r30,
          row.r31,
          row.r32,
          row.r33,
          row.r34,
          row.r35,
          row.r36,
          row.r37,
          row.r38,
          row.r39,
          row.r40,
          row.r41,
          row.r42,
          row.r43,
          row.r44,
          row.r45,
          row.r46,
          row.r47,
          row.r48,
          row.r49,
          row.r50,
          row.r51,
          row.r52,
          row.r53,
          row.r54,
          row.r55,
          row.c1,
          row.c2,
          row.c3,
          row.c4,
          row.c5,
          row.c6,
          row.c7,
          row.c8,
          row.c9,
          row.c10,
          row.c11,
          row.c12,
          row.c13,
          row.c14,
          row.c15,
          row.c16,
          row.c17,
          row.c18,
          row.c19,
          row.c20,
          row.c21,
          encrypt(row.s1),
          row.s20,
          row.s21,
          row.s22,
          row.s23,
          row.s30,
          row.s31,
          row.s32,
          row.s33,
          row.s40,
          row.s41,
          row.s42,
          row.s43,
          row.s50,
          row.s51,
          row.s52,
          row.s53,
          row.cv1
        ],
        (err) => {
          if (err) {
            logError("writeClient db.run(insert) ", err);
          } else {
          }
        }
      );
    }
    db.close();
  });
};

//reads all the clients in the table
var readTable = (flt) => {
  const encryptedFields = [
    "t1",
    "t2",
    "t3",
    "t4",
    "t5",
    "t6",
    "t7",
    "t8",
    "t9",
    "t10",
    "t11",
    "t12",
    "t13",
    "d1",
    "d2",
    "s1",
    "p1"
  ];
  const strShort = "ID,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,d1,d2,s1,p1";
  const strAll = "*";
  var sql = "";
  if (flt == "all") {
    sql = strAll;
  } else {
    sql = strShort;
  }
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all("select " + sql + " from client", (err, rows) => {
          if (err) {
            reject(err);
          } else {
            Array.from(rows).forEach((row) => {
              for (var key in row) {
                if (encryptedFields.includes(key)) {
                  //decrypt all fields with keys found in encryptedFields
                  row[key] = decrypt(row[key]);
                }
              }
            });
          }
          objSort(rows, "d1", "t2", "t1"); //sort
          resolve(rows); //send the results
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value; //this will be an array of json objects
  });
};

//reads a single client from the database as defined by ID
var readClient = (ID) => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READONLY);
  var getData = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("select * from client where ID=" + ID, (err, row) => {
          if (err) {
            reject(err);
          } else {
            for (var key in row) {
              switch (key) {
                case key.match("t"): //starts with a 't'
                case key.match("d"): //starts with a 'd'
                case "p1": //phone
                case "s1": //state
                  row[key] = decrypt(row[key]);
                  break;
                default: {
                }
              }
            }
            resolve(row);
          }
        });
        db.close();
      });
    });
  };
  return getData().then((value) => {
    return value; //this will be a json object
  });
};

var logError = (f, err) => {
  const e = err.message;
  console.log(`sqlite ${f} error: ${e}`);
};

function objSort() {
  var args = arguments,
    array = args[0],
    case_sensitive,
    keys_length,
    key,
    desc,
    a,
    b,
    i;

  if (typeof arguments[arguments.length - 1] === "boolean") {
    case_sensitive = arguments[arguments.length - 1];
    keys_length = arguments.length - 1;
  } else {
    case_sensitive = false;
    keys_length = arguments.length;
  }

  return array.sort(function (obj1, obj2) {
    for (i = 1; i < keys_length; i++) {
      key = args[i];
      if (typeof key !== "string") {
        desc = key[1];
        key = key[0];
        a = obj1[args[i][0]];
        b = obj2[args[i][0]];
      } else {
        desc = false;
        a = obj1[args[i]];
        b = obj2[args[i]];
      }

      if (case_sensitive === false && typeof a === "string") {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }

      if (!desc) {
        if (a < b) return -1;
        if (a > b) return 1;
      } else {
        if (a > b) return -1;
        if (a < b) return 1;
      }
    }
    return 0;
  });
} //end of objSort() function

var deleteClientData = () => {
  var db = new sqlite.Database(dbname, sqlite.OPEN_READWRITE);
  db.run("delete from client", (err) => {
    if (err) {
      console.log(err);
    }
  });
  db.close();
};

exports.openDatabase = openDatabase;

exports.writeClient = writeClient;
exports.updateClient = updateClient;
exports.readTable = readTable;
exports.readClient = readClient;
exports.deleteClientData = deleteClientData;

exports.usersTableExists = usersTableExists;
exports.createUsersTable = createUsersTable;
exports.deleteUsersTable = deleteUsersTable;
exports.updateUser = updateUser;
exports.insertUser = insertUser;
exports.readUser = readUser;
exports.readUsers = readUsers;
exports.readUserById = readUserById;
exports.deleteUserById = deleteUserById;
