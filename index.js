const express = require("express")
const app = express()
const path = require("path")
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const ejsMate = require("ejs-mate")
const mysql = require("mysql2");
const session = require("express-session");
const { log } = require("console");

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

const connection=mysql.createConnection({
    host: "localhost",
    user:"root",
    database:"KR3Database",
    password:"MYSQL@123"
  });

app.get("/",(req,res)=>{
    res.render("home.ejs");
})


app.post('/register', (req, res) => {
    let data =  req.body;
    console.log(new Date());
    if(data.password == data.con_password){
        let sql = "INSERT INTO users(FULLNAME, EMAIL, PASSWORD) VALUES (?, ?, ?,?,?)";
        let values = [data.name, data.email, data.password];
        try{
            connection.query(sql, values,(err,result)=>{
                if(err) throw err;
                 res.redirect("/login")
    
            })
        }catch(err){
            res.send("err in db");
            console.log(err);
        }
    }
    
});

app.get("/login",(req, res ) => {
    
    res.render("login.ejs");
});

app.post('/login', (req, res) => {
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
                    res.render("loginhome.ejs",{user});
                });
            } else {
                return res.status(400).send('Invalid email or password');
            }
        } else {
            return res.status(400).send('Invalid email or password');
        }
    });
});
// Admin Login Route
app.post('/adminLogin', (req, res) => {
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
});



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
app.get('/aptitude', (req, res) => {
    const sql = "SELECT * FROM aptitude_questions"; // Query to select all aptitude questions
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching aptitude questions:", err);
            return res.status(500).send("Database error");
        }
        
        res.render("tests/aptitude.ejs", { questions: results });
    });
});

app.get("/uploadQuestions",(req, res ) => {
    if (req.session && req.session.admin) {
        res.render("admin/uploadQuestions.ejs");
    } else {
        res.redirect("/adminLogin"); 
    }
});

app.post('/uploadQuestions', (req, res) => {
    let data =  req.body;
    let sqlQuery = "INSERT INTO aptitude_questions (question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES(?,?,?,?,?,?,?)";
    let val = [data.questionText, data.optionA, data.optionB, data.optionC, data.optionD, data.correctOption, data.difficultyLevel];
    try{
    connection.query(sqlQuery, val,(err,result)=>{
        if(err) throw err;
            res.send("successfully uploaded")
    })
    }catch(err){
        res.send("err in db");
        console.log(err);
    }
});

app.get("/manageQuestions",(req, res ) => {
    if (req.session && req.session.admin) {
        const sql = "SELECT * FROM aptitude_questions"; // Query to select all aptitude questions
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching aptitude questions:", err);
            return res.status(500).send("Database error");
        }
        
        res.render("admin/manageQuestions.ejs", { questions: results });
    });
    } else {
        res.redirect("/adminLogin"); 
    }
});

app.get("/allUsres",(req, res ) => {
    if (req.session && req.session.admin) {
        const sql = "SELECT * FROM users ORDER BY ID DESC"; 
    
        connection.query(sql, (err, users) => {
            if (err) {
                console.error("Error fetching aptitude questions:", err);
                return res.status(500).send("Database error");
            }
            
            res.render("admin/allUser.ejs", { users });
        });
    }
     else
    {
        res.redirect("/adminLogin"); 
    }
});

app.get("/manageQuestions/:id/edit",async(req,res)=>{
    let {id} = req.params;
        if (req.session && req.session.admin) {
       const sql = "SELECT * from  aptitude_questions where question_id = ?"; 
    
    connection.query(sql,[id], (err, result) => {
        console.log(result);
        if (err) {
            console.error("Error fetching aptitude questions:", err);
            return res.status(500).send("Database error");
        }
        
        res.render("admin/editQuestions.ejs",{result: result[0]});
    });
} else {
    res.redirect("/adminLogin"); 
}
});

app.put("/manageQuestions/:id",async(req,res)=>{
    let {id} =req.params;
    let data = req.body;
    console.log([id])
    if (req.session && req.session.admin) {     
        let updateSql = "UPDATE aptitude_questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, difficulty_level = ? WHERE question_id = ? ";
        connection.query(updateSql, [data.question_text, data.option_a, data.option_b, data.option_c, data.option_d, data.correct_option, data.difficulty_level , id], (err, updateResult) => {
            if (err) throw err;
            res.redirect("/manageQuestions");
        });
    }
    else 
    {
        res.redirect("/adminLogin"); 
    }
});



app.delete("/manageQuestions/:id",async(req,res)=>{
    let {id} =req.params;
     if (req.session && req.session.admin) {     
        let deleteSql = "DELETE FROM aptitude_questions WHERE question_id = ? ";
                connection.query(deleteSql,[id], (err, deletedResult) => {
                    if (err) throw err;
                    console.log(deletedResult);
                    res.redirect("/manageQuestions");
     });
    }
    else 
    {
        res.redirect("/adminLogin"); 
    }
});

app.get("/tables", (req, res) => {
    // Check if the user is an admin
    if (req.session && req.session.admin) {
        const query = "SHOW TABLES";

        connection.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error retrieving tables.");
            }

            // Filter out unwanted tables
            const filteredTables = results.filter(table => 
                table.Tables_in_kr3database !== 'admin_profile' && 
                table.Tables_in_kr3database !== 'users'
            );

            // Render a view to display the filtered tables
            res.render("admin/tables.ejs", { tables: filteredTables });
        });
    } else {
        res.redirect("/adminLogin");
    }
});


app.listen(8080,()=>{
    console.log("app is listening on 8080");
});