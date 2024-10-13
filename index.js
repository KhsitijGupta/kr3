const express = require("express")
const app = express()
const path = require("path")
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const ejsMate = require("ejs-mate")
const mysql = require("mysql2");
const session = require("express-session");
const { log } = require("console");
const questionSchema = require("./questionSchema")
const deletetableSchema = require("./deletetableSchema")
const wrapAsync= require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const multer = require('multer');
const fs = require('fs');


app.use(session({
    secret: 'KR3Secret@', // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set 'true' if using https
}));


//for delete and put request
app.use(methodOverride("_method"))
// ejs(html) file linking
app.set("views", path.join(__dirname, "views"))
app.set("views engine", "ejs")
//ejs mate
app.engine("ejs",ejsMate)
// css file linking
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // To handle form data
app.use(express.json()); // To handle JSON data 

// Serve the uploads folder publicly to serve the uploaded files
app.use('/uploads', express.static('uploads'));

const connection=mysql.createConnection({
    host: "localhost",
    user:"root",
    database:"KR3Database",
     password:"MYSQL@123"
  });


const validatequestion=(req ,res ,next)=>{
    let {error} = questionSchema.validate(req.body);
        if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");
            res.send(errmsg)
        }
        else{
            next();
        }
};
const validateTableName=(req ,res ,next)=>{
    let {error} = deletetableSchema.validate(req.body);
        if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");
            res.send(errmsg)
        }
        else{
            next();
        }
};


const showTables = async (req, res, next) => {
    try {
        const query = "SHOW TABLES";

        // Execute the query to get the tables
        connection.query(query, (err, results) => {
            if (err) {
                console.error("Error retrieving tables:", err);
                return res.status(500).send("Error retrieving tables.");
            }

            // Filter the tables to include only those containing "questions"
            const filteredTables = results
                .map(table => {
                    const tableName = table.Tables_in_kr3database;
                    const splitTableName = tableName.split('_');
                    const containsQuestions = splitTableName.includes("questions");

                    return { 
                        originalTableName: tableName, 
                        splitTableName, 
                        containsQuestions 
                    };
                });

            const tablesWithQuestions = filteredTables.filter(table => table.containsQuestions);

            // Attach the filtered tables to the req object
            req.tablesWithQuestions = tablesWithQuestions;
            next(); // Pass control to the next middleware
        });
    } catch (error) {
        console.error("Error in showTables:", error);
        next(error); // Pass the error to the next middleware or error handler
    }
};


app.get("/",(req,res)=>{
    if ( req.session.userId){
    let sql = "SELECT * FROM users WHERE Id = ?";
    connection.query(sql, req.session.userId , (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        if (result.length > 0) {
            const user = result[0];
            res.render("loginhome.ejs",{ user });
        }
    });
    }
    else{
        res.render("home.ejs");
        }
})

app.get('/userlogout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/'); 
    });
});

app.post('/register', wrapAsync(async (req, res) => {
    let data = req.body;

    if (data.password !== data.con_password) {
        return res.render("error.ejs", {
            statusCode: 400,
            message: "Passwords do not match."
        });
    }

    let sql = "INSERT INTO users(FULLNAME, EMAIL, PASSWORD) VALUES (?,?,?)";
    let values = [data.name, data.email, data.password];

    try {
        connection.query(sql, values, (err, result) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
            // Redirect only if there are no errors
            res.redirect("/login");
        });
    } catch (err) {
        let { statusCode = 500, message = "Something went wrong" } = err;
        res.render("error.ejs", { statusCode, message });
    }
}));


app.get("/login",(req, res ) => {
    
    res.render("login.ejs");
});

app.post('/login',wrapAsync(async(req, res) => {
    let data = req.body;
    let sql = "SELECT * FROM users WHERE EMAIL = ?";
    let values = [data.email];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        if (result.length > 0) {
            const user = result[0];
            // console.log(user.FULLNAME)
            if (user.PASSWORD === data.password) {
                let updateSql = "UPDATE users SET LAST_LOGIN = NOW() WHERE id = ?";
                connection.query(updateSql, [user.ID], (err, updateResult) => {
                    if (err) throw err;
                    
                     // Create a session for the user
                     req.session.userId = user.ID;
                     req.session.userName = user.FULLNAME;
                     req.session.loggedIn = true;


                    res.render("loginhome.ejs",{user});
                });
            } else {
                return res.status(400).send('Invalid email or password');
            }
        } else {
            return res.status(400).send('Invalid email or password');
        }
    });
}));



// Admin Login Route
app.post('/adminLogin', wrapAsync(async(req, res) => {
    let data = req.body;
    let sql = "SELECT * FROM admin_profile WHERE username = ?";
    let values = [data.username];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        
        if (result.length > 0) {
            const admin = result[0];
            if (admin.password === data.password) {
                req.session.admin = admin; // Set session for admin
                let updateSql = "UPDATE admin_profile SET last_login = NOW() WHERE id = ?";
                connection.query(updateSql, [admin.id], (err, updateResult) => {
                    if (err) throw err;
                    res.redirect("/adminDashboard");
                });
            } else {
                return res.status(400).send('Invalid username or password');
            }
        } else {
            return res.status(400).send('Invalid username or password');
        }
    });
}));



// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        next(); 
    } else {
        res.redirect("/adminLogin"); 
    }
}

app.get("/adminDashboard", isAdmin, (req, res) => {
    res.render("admin/admin.ejs");
});

app.get("/logined",(req, res ) => {
     
    res.render("admin/adminLogin.ejs");
});

app.get("/adminLogin",(req, res ) => {
     
    res.render("admin/adminLogin.ejs");
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to clear session');
        }
        res.redirect('/');  
    });
});

app.get('/contest', wrapAsync(async (req, res) => {
    if(req.session.userId){
        let ContestTableName;
        // Getting today date
        let todayDate = new Date(Date.now()).toLocaleDateString('en-CA');
        
        const sqlQuery = `SELECT * FROM admin_contest WHERE Date = '${todayDate}';`
        try{
            const tablesResults = await new Promise((resolve, reject) => {
                connection.query(sqlQuery, (err, results) => {
                    if (err) reject(err); // if id is not available then throw err
                    else resolve(results);
                });
            });

            const nextQuery = `SELECT Date FROM admin_contest WHERE Date > '${todayDate}';`
            const nextContest = await new Promise((resolve, reject) => {
                connection.query(nextQuery, (err, results) => {
                    if (err) reject(err); // if id is not available then throw err
                    else resolve(results);
                });
            });

            ContestTableName = tablesResults[0];
            if (ContestTableName == null){
               return res.render("alert.ejs",{message: "Next contest is on: "+nextContest[0].Date.toDateString()});
            }
            
        } catch(err) {
            //let { statusCode = 500, message = "Something went wrong" } = ;
            //return res.render("error.ejs", { statusCode:200 , message: "Today, No any contest available" }); // render on alert.
        }

        const sql = "SELECT * FROM "+ContestTableName.ContestNameTable+" ORDER BY RAND() LIMIT 25"; 
    
        // Execute the query for the questions
        connection.query(sql, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
        
            // Render the questions in the test.ejs template
            res.render("tests/test.ejs", { questions: results });
        });
    }
    else{
        res.redirect('/')
    }
}));

app.get('/test', showTables, wrapAsync(async (req, res) => {
    if(req.session.userId){
        const sql = "SELECT * FROM aptitude_subject_questions ORDER BY RAND() LIMIT 25"; 
    
        // Access the filtered tables from req object
        // console.log(req.tablesWithQuestions[2].originalTableName);
    
        // Execute the query for the questions
        connection.query(sql, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
            
            // Render the questions in the test.ejs template
            res.render("tests/test.ejs", { questions: results });
        });
    }
    else{
        res.redirect('/')
    }
}));



app.get("/uploadQuestions",wrapAsync(async(req, res ) => {
    // Check if the user is an admin
    if (req.session && req.session.admin) {
        const query = "SHOW TABLES";

        connection.query(query, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
              }

            // Filter out unwanted tables
            const filteredTables = results
                .map(table => {
                    // Split the table name by underscore
                    const splitTableName = table.Tables_in_kr3database.split('_');

                    // Check if "questions" is part of the split table name
                    const containsQuestions = splitTableName.includes("questions");

                    // Return both the original table name and whether it contains "questions"
                    return { 
                        originalTableName: table.Tables_in_kr3database, 
                        splitTableName, 
                        containsQuestions 
                    };
                });

            // Render a view to display only tables containing "questions"
            const tablesWithQuestions = filteredTables.filter(table => table.containsQuestions);

            res.render("admin/uploadQuestions.ejs", { tables: tablesWithQuestions });
        });
    } else {
        res.redirect("/adminLogin"); 
    }
}));

app.post('/uploadQuestions', validatequestion , async(req, res) => {
    const query = "SHOW TABLES";

        connection.query(query, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
        });
    let data =  req.body;
    // console.log(data)
    let sqlQuery = "INSERT INTO "+data.subjects+" (question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES(?,?,?,?,?,?,?)";
    let val = [data.questionText, data.optionA, data.optionB, data.optionC, data.optionD, data.correctOption, data.difficultyLevel];
    try{
    connection.query(sqlQuery, val,(err,result)=>{
        if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }
        //res.send("<>alert('successfully uploaded');</script>");
        res.send("successfully uploaded");
    })
    }catch(err){
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
    }
});


app.get("/allUsres",wrapAsync(async(req, res ) => {
    if (req.session && req.session.admin) {
        const sql = "SELECT * FROM users ORDER BY ID DESC"; 
    
        connection.query(sql, (err, users) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
            }
            
            res.render("admin/allUser.ejs", { users });
        });
    }
    else
    {
        res.redirect("/adminLogin"); 
    }
}));

app.get("/manageQuestions",wrapAsync(async(req, res ) => {
    if (req.session && req.session.admin) {
        const query = "SHOW TABLES";
        let tablesWithQuestions;
        try {
            const tablesResults = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Process the results from the first query
            const filteredTables = tablesResults
                .map(table => {
                    const splitTableName = table.Tables_in_kr3database.split('_');
                    const containsQuestions = splitTableName.includes("questions");
                    return { 
                        originalTableName: table.Tables_in_kr3database, 
                        splitTableName, 
                        containsQuestions 
                    };
                });
            
            // Filter tables containing 'questions'
             tablesWithQuestions = filteredTables.filter(table => table.containsQuestions);
        } catch {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }

        const sql = "SELECT * FROM aptitude_subject_questions"; // Query to select all aptitude questions
        connection.query(sql, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
            
            res.render("admin/manageQuestions.ejs", { questions: results, tables : tablesWithQuestions });
        });
    } else {
        res.redirect("/adminLogin"); 
    }
}));

app.get("/filtermanageQuestions", wrapAsync(async (req, res) => {
    if (req.session && req.session.admin) {
        const query = "SHOW TABLES";
        let tablesWithQuestions;
        try {
            const tablesResults = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Process the results from the first query
            const filteredTables = tablesResults
                .map(table => {
                    const splitTableName = table.Tables_in_kr3database.split('_');
                    const containsQuestions = splitTableName.includes("questions");
                    return { 
                        originalTableName: table.Tables_in_kr3database, 
                        splitTableName, 
                        containsQuestions 
                    };
                });
            
            // Filter tables containing 'questions'
             tablesWithQuestions = filteredTables.filter(table => table.containsQuestions);
            }catch
            {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
            }
        const { subject, difficulty } = req.query; // Get selected subject (table) and difficulty from the form
        
        // Make sure to convert the subject back to the original table name
        const tableName = subject.replace(/ /g, '_').toLowerCase(); // Convert the subject to the table format
        
        let sql = `SELECT * FROM ??`; // Base query to select from the table
        const queryParams = [tableName];
        // If difficulty is selected, add it as a filter in the query
        if (difficulty) {
            sql += ` WHERE difficulty_level = ?`;
            queryParams.push(difficulty);
        }
        
        try {
            const questions = await new Promise((resolve, reject) => {
                connection.query(sql, queryParams, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Render the manageQuestions page with the filtered questions
            res.render("admin/manageQuestions.ejs", { questions, tables: [] , tables : tablesWithQuestions}); // Pass the filtered questions to the template
        } catch (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }
    } else {
        res.redirect("/adminLogin");
    }
}));




app.get("/manageQuestions/:id/edit", wrapAsync(async(req,res)=>{
    let {id} = req.params;
        if (req.session && req.session.admin) {
       const sql = "SELECT * from  aptitude_subject_questions where question_id = ?"; 
    
    connection.query(sql,[id], (err, result) => {
        console.log(result);
        if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }
        
        res.render("admin/editQuestions.ejs",{result: result[0]});
    });
} else {
    res.redirect("/adminLogin"); 
}
}));

app.put("/manageQuestions/:id",wrapAsync(async(req,res)=>{
    let {id} =req.params;
    let data = req.body;
    console.log([id])
    if (req.session && req.session.admin) {     
        let updateSql = "UPDATE aptitude_subject_questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, difficulty_level = ? WHERE question_id = ? ";
        connection.query(updateSql, [data.question_text, data.option_a, data.option_b, data.option_c, data.option_d, data.correct_option, data.difficulty_level , id], (err, updateResult) => {
            if (err) throw err;
            res.redirect("/manageQuestions");
        });
    }
    else 
    {
        res.redirect("/adminLogin"); 
    }
}));
  

app.delete("/manageQuestions/:id",wrapAsync(async(req,res)=>{
    let {id} =req.params;
     if (req.session && req.session.admin) {     
        let deleteSql = "DELETE FROM aptitude_subject_questions WHERE question_id = ? ";
                connection.query(deleteSql,[id], (err, deletedResult) => {
                    if (err) {
                        let { statusCode = 500, message = "Something went wrong" } = err;
                        return res.render("error.ejs", { statusCode, message });
                    }
                    console.log(deletedResult);
                    res.redirect("/manageQuestions");
     });
    }
    else 
    {
        res.redirect("/adminLogin"); 
    }
}));


app.get("/manageSubjects", wrapAsync(async (req, res) => {
    if (req.session && req.session.admin) {
        // First query to fetch the list of tables
        const query = "SHOW TABLES";

        try {
            const tablesResults = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Process the results from the first query
            const filteredTables = tablesResults
                .map(table => {
                    const splitTableName = table.Tables_in_kr3database.split('_');
                    const containsQuestions = splitTableName.includes("subject") && splitTableName.includes("questions");
                    return { 
                        originalTableName: table.Tables_in_kr3database, 
                        splitTableName, 
                        containsQuestions 
                    };
                });

            // Filter tables containing 'questions'
            const tablesWithQuestions = filteredTables.filter(table => table.containsQuestions);

            // Create an array of promises for each table's easy, medium, and hard question count queries
            const difficultyCountsPromises = tablesWithQuestions.map(table => {
                const tableName = table.originalTableName;

                // Queries for Easy, Medium, and Hard question counts
                const easyQuery = `SELECT count(question_id) as easyCount FROM ${tableName} WHERE difficulty_level = 'Easy';`;
                const mediumQuery = `SELECT count(question_id) as mediumCount FROM ${tableName} WHERE difficulty_level = 'Medium';`;
                const hardQuery = `SELECT count(question_id) as hardCount FROM ${tableName} WHERE difficulty_level = 'Hard';`;

                // Execute all queries for this table
                return Promise.all([
                    new Promise((resolve, reject) => {
                        connection.query(easyQuery, (err, results) => {
                            if (err) reject(err);
                            else resolve({ tableName, easyCount: results[0].easyCount });
                        });
                    }),
                    new Promise((resolve, reject) => {
                        connection.query(mediumQuery, (err, results) => {
                            if (err) reject(err);
                            else resolve({ tableName, mediumCount: results[0].mediumCount });
                        });
                    }),
                    new Promise((resolve, reject) => {
                        connection.query(hardQuery, (err, results) => {
                            if (err) reject(err);
                            else resolve({ tableName, hardCount: results[0].hardCount });
                        });
                    })
                ]);
            });

            // Execute all the promises and structure the results
            const difficultyCountsResults = await Promise.all(difficultyCountsPromises);

            // Combine results for each table
            const combinedDifficultyCounts = difficultyCountsResults.map(countsArray => {
                const easyCount = countsArray[0].easyCount;
                const mediumCount = countsArray[1].mediumCount;
                const hardCount = countsArray[2].hardCount;
                const tableName = countsArray[0].tableName; // Table name will be the same across all counts
                return { tableName, easyCount, mediumCount, hardCount };
            });

            // Render the view with the tables and difficulty question counts
            res.render("admin/manageSubjects.ejs", { tables: tablesWithQuestions, difficultyCounts: combinedDifficultyCounts });
        } catch (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }
    } else {
        res.redirect("/adminLogin");
    }
}));



app.post('/manageSubjects/delete',validateTableName, wrapAsync(async(req, res) => {
    let data =  req.body;
    if(Object.keys(data) == "deleteTable"){
        let reqData = data.deleteTable.replace(/ /g,"_").toLowerCase();
        
        let deleteQuery = "DROP TABLE "+reqData+";";
        try{
            connection.query(deleteQuery, (err,result)=>{
                if (err) {
                    let { statusCode = 500, message = "Something went wrong" } = err;
                    return res.render("error.ejs", { statusCode, message });
                }
                    res.send("deleted successfully")
            })
            }catch(err){
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
    }
    else{
        res.send("Table not found!");
    }
}));


app.post('/manageSubjects', wrapAsync(async(req, res) => {
    let data = req.body;
    let reqData = data.newTable.replace(/ /g, "").toLowerCase() + "_subject_questions";
    const query = "SHOW TABLES";
    
    connection.query(query, (err, results) => {
        if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }

        // Convert the array of results into an array of table names
        let arrOfDbTable = results.map(row => Object.values(row)[0]);
        if (arrOfDbTable.includes(reqData)) {
            return res.send("Table already exists");
        } else {
            // Ensure the 'newTable' key exists in the data
            if (Object.keys(data).includes("newTable")) {
                let createQuery = `CREATE TABLE ${reqData} (
                    question_id INT AUTO_INCREMENT PRIMARY KEY,
                    question_text VARCHAR(255) NOT NULL,
                    option_a VARCHAR(100) NOT NULL,
                    option_b VARCHAR(100) NOT NULL,
                    option_c VARCHAR(100) NOT NULL,
                    option_d VARCHAR(100) NOT NULL,
                    correct_option CHAR(1) NOT NULL,
                    difficulty_level VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`;
                
                try {
                    connection.query(createQuery, (err, result) => {
                        if (err) {
                            let { statusCode = 500, message = "Something went wrong" } = err;
                            return res.render("error.ejs", { statusCode, message });
                        }
                        res.send("Table created successfully");
                    });
                } catch (err) {
                    let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
                }
            } else {
                res.status(400).send("Invalid data: 'newTable' key is missing");
            }
        }
    });
}));

// Get All Tables
app.get('/manageTests', async (req, res) => {
    const query = "SELECT * FROM admin_contest";
    
    try{
        connection.query(query, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
            }
            console.log(results[0])
            res.render("admin/manageTests.ejs",{results : results});
        });
    }catch (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        
        }
      });


app.post('/manageTests/delete',validateTableName, wrapAsync(async(req, res) => {
    let data =  req.body;
    if(Object.keys(data) == "deleteTable"){
        let reqData = data.deleteTable.replace(/ /g,"_").toLowerCase();
        
        let deleteQuery = "DROP TABLE "+reqData+";";
        try{
            connection.query(deleteQuery, (err,result)=>{
                if (err) {
                    let { statusCode = 500, message = "Something went wrong" } = err;
                    return res.render("error.ejs", { statusCode, message });
                }
                    res.send("deleted successfully")
            })
            }catch(err){
                    let { statusCode = 500, message = "Something went wrong" } = err;
                    return res.render("error.ejs", { statusCode, message });
                }
    }
    else{
        res.send("Table not found!");
    }
}));

app.post('/manageTests', wrapAsync(async(req, res) => {
    let data = req.body;
    let reqData = data.newTable.replace(/ /g, "").toLowerCase() + "_test";
    const query = "SHOW TABLES";
    
    connection.query(query, (err, results) => {
        if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
        }

        // Convert the array of results into an array of table names
        let arrOfDbTable = results.map(row => Object.values(row)[0]);
        if (arrOfDbTable.includes(reqData)) {
            return res.send("Table already exists");
        } else {
            // Ensure the 'newTable' key exists in the data
            if (Object.keys(data).includes("newTable")) {
                let createQuery = `CREATE TABLE ${reqData} (
                    contest_id INT AUTO_INCREMENT PRIMARY KEY,
                    date VARCHAR(255) NOT NULL DEFAULT 'NA',
                    time VARCHAR(100) NOT NULL DEFAULT 'NA',
                    duration VARCHAR(100) NOT NULL DEFAULT 'NA',
                    no_of_questions VARCHAR(100) NOT NULL DEFAULT 'NA',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`;
                
                try {
                    connection.query(createQuery, (err, result) => {
                        if (err) {
                            let { statusCode = 500, message = "Something went wrong" } = err;
                            return res.render("error.ejs", { statusCode, message });
                        }
                        res.send("Table created successfully");
                    });
                } catch (err) {
                        let { statusCode = 500, message = "Something went wrong" } = err;
                        return res.render("error.ejs", { statusCode, message });
                    
                }
            } else {
                res.status(400).send("Invalid data: 'newTable' key is missing");
            }
        }
    });
}));


app.get("/createContest",(req, res ) => {
    if (req.session && req.session.admin) {     
        res.render("admin/createContest.ejs");
    }
    else{
        res.redirect("/adminLogin"); 
    
    }
});


app.post('/admin/contest/create', (req, res) => {
    if (req.session && req.session.admin) {     
    
    const { contestName, date, time, duration, noOfQuestions, details } = req.body;
    // console.log(date)
    const contestNameTable = req.body.contestName.replace(/ /g, "").toLowerCase() + "_contest_questions";
    const query = `
    INSERT INTO admin_contest (ContestName, ContestNameTable, Date, Time, Duration, NoOfQuestions, Details)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    connection.query(query, [contestName,contestNameTable, date, time, duration, noOfQuestions, details], (error, results) => {
        if (error) {
            const { statusCode = 500, message = "Something went wrong" } = error;
            return res.render("error.ejs", { statusCode, message });
               }
    });
    let createQuery = `CREATE TABLE ${contestNameTable} (
        question_id INT AUTO_INCREMENT PRIMARY KEY,
        question_text VARCHAR(255) NOT NULL,
        option_a VARCHAR(100) NOT NULL,
        option_b VARCHAR(100) NOT NULL,
        option_c VARCHAR(100) NOT NULL,
        option_d VARCHAR(100) NOT NULL,
        correct_option CHAR(1) NOT NULL,
        difficulty_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    
    try {
        connection.query(createQuery, (err, result) => {
            if (err) {
                const { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
            }
            res.send(`contest created successfully
                <br>
                <a href=/manageTests><button>DONE</button></a>
                `);
        });
    } catch (err) {
        const { statusCode = 500, message = "Something went wrong" } = err;
        return res.render("error.ejs", { statusCode, message });
    }
}
else{
    res.redirect("/adminLogin"); 

}

});




app.get("/courseCategories",(req, res ) => {
    if (req.session && req.session.admin) {     

    res.render("admin/courseCategories.ejs");
}
else{
    res.redirect("/adminLogin"); 

}
});

app.get("/admin/edit-contest/:id", async(req, res ) => {
    let {id}=req.params;
    if (req.session && req.session.admin) {
        const sql = `SELECT * FROM admin_contest where id = ${id}`; 

        connection.query(sql, (err, results) => {
            if (err) {
                let { statusCode = 500, message = "Something went wrong" } = err;
                return res.render("error.ejs", { statusCode, message });
                
            }
            res.render("admin/editContest.ejs",{results:results[0]});
            //console.log(results)
        });
    }
    else{
        res.redirect("/adminLogin"); 
    }
});
app.put("/admin/contest/edit/:id",(req, res ) => {
    let {id} =req.params;
    let data = req.body;
    //console.log(data)
    if (req.session && req.session.admin) {     
        let updateSql = "UPDATE admin_contest SET Date = ? , Time  = ? , Duration  = ? , NoOfQuestions = ?, Details = ? WHERE id = ? ";
        connection.query(updateSql, [data.Date, data.Time, data.Duration, data.NoOfQuestions,data.Details, id], (err, updateResult) => {
            if (err) {
                let {statusCode=500 , message="Something went wrong"} = err;
                return res.render("error.ejs",{statusCode , message});
            };
            res.redirect("/manageTests");
        });
    }
    else 
    {
        res.redirect("/adminLogin"); 
    }
});

// Define storage options for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Directory to save the uploaded file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
  
  // File upload middleware
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      // Only allow certain file types (images)
      const fileTypes = /jpeg|jpg|png|gif/;
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images are allowed!'));
      }
    }
  }).single('photoId');
  
  app.put('/uploadPhoto/:id', async (req, res) => {
    if (req.session && req.session.admin) {

    // Handle file upload using multer
    let id = req.params.id; // Correctly extract the user ID

    upload(req, res, (err) => {
        if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
          }
      else if(!req.file){
        const updateName = req.body.updateName; 
        
        const updatenameSql = "UPDATE users SET  FULLNAME = ? WHERE id = ?";
        connection.query(updatenameSql, [ updateName, id], (err, updateResult) => {
          if (err) {
            // Error handling for SQL query
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
          }
    
          // Successfully updated the user, redirect to login
          return res.send('uploaded succesfully ');
        });
      }
      // Extract parameters and form data
      else{
        const updateName = req.body.updateName; 
        const imagePath = req.file.filename; // The uploaded image file name
  
        // SQL query to update user info
        const updateSql = "UPDATE users SET userImage = ?, FULLNAME = ? WHERE id = ?";
        connection.query(updateSql, [imagePath, updateName, id], (err, updateResult) => {
          if (err) {
            let { statusCode = 500, message = "Something went wrong" } = err;
            return res.render("error.ejs", { statusCode, message });
          }
    
          // Successfully updated the user, redirect to login
          res.send('uploaded succesfully '); // Correctly redirect the user
        });
      }
    });
}
else{
    res.redirect("/adminLogin"); 
}
  });
  
app.get("*", (req, res , next) => {
    next(new ExpressError(404,"Page not found"));
});
app.use((err, req, res,next )=>{
    let {statusCode=500 , message="Something went wrong"} = err;
    res.render("error.ejs",{statusCode , message})
});

app.listen(8080,()=>{
    console.log("app is listening on 8080");
});
