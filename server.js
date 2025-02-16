/********************************************************************************* 
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*  Name: BHAVYA GOSWAMI Student ID: 148780232 Date: ____2024-08-11___________
********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// Configure Handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Middleware to handle active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", { students: data });
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render("students", { students: data });
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    }
});

app.get("/students/add", (req, res) => {
    data.getCourses().then((courses) => {
        res.render("addStudent", { courses: courses });
    }).catch((err) => {
        res.render("addStudent", { message: "no courses available" });
    });
});

app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    data.getStudentByNum(req.params.studentNum).then((student) => {
        if (student) {
            viewData.student = student;
        } else {
            viewData.student = null;
        }
    }).catch(() => {
        viewData.student = null;
    }).then(data.getCourses)
      .then((courses) => {
        viewData.courses = courses;
        if (viewData.student == null) {
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData });
        }
    }).catch(() => {
        viewData.courses = [];
        res.render("student", { viewData: viewData });
    });
});

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch((err) => {
        res.status(500).send("Unable to update student");
    });
});

app.get("/courses", (req, res) => {
    data.getCourses().then((data) => {
        res.render("courses", { courses: data });
    }).catch((err) => {
        res.render("courses", { message: "no results" });
    });
});

// Route to render the "Add Course" page
app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

// Route to handle the "Add Course" form submission
app.post("/courses/add", (req, res) => {
    data.addCourse(req.body).then(() => {
        res.redirect("/courses");
    }).catch(err => {
        res.status(500).send("Unable to add course");
    });
});

// Route to display a course's details for editing
app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id).then((courseData) => {
        if (courseData) {
            res.render("course", { course: courseData });
        } else {
            res.status(404).send("Course Not Found");
        }
    }).catch((err) => {
        res.render("course", { message: "no results" });
    });
});

// Route to handle course updates
app.post("/course/update", (req, res) => {
    data.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    }).catch((err) => {
        res.status(500).send("Unable to update course");
    });
});

// Route to delete a course (optional)
app.get("/course/delete/:id", (req, res) => {
    data.deleteCourseById(req.params.id).then(() => {
        res.redirect("/courses");
    }).catch(err => {
        res.status(500).send("Unable to remove course / Course not found");
    });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

data.initialize().then(function() {
    app.listen(HTTP_PORT, function() {
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err) {
    console.log("unable to start server: " + err);
});

// Export the server for Vercel
module.exports = app;
