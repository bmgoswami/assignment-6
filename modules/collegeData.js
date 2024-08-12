const { Sequelize, DataTypes } = require('sequelize');

// Set up Sequelize to point to our Postgres database
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'IfYk7LqDFW0p', {
    host: 'ep-round-lab-a5sdvkqz-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }, 
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define("Student", {
  studentNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  addressStreet: DataTypes.STRING,
  addressCity: DataTypes.STRING,
  addressProvince: DataTypes.STRING,
  TA: DataTypes.BOOLEAN,
  status: DataTypes.STRING,
});

// Define the Course model
const Course = sequelize.define("Course", {
  courseId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: DataTypes.STRING,
  courseDescription: DataTypes.STRING,
});

// Establish relationships
Course.hasMany(Student, { foreignKey: "course" });

// Initialize the database
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        console.log("Database synced successfully.");
        resolve();
      })
      .catch((err) => {
        console.error("Error syncing database:", err);
        reject("Unable to sync the database: " + err);
      });
  });
}

// Get all students
function getAllStudents() {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((students) => resolve(students))
      .catch((err) => {
        console.error("Error retrieving all students:", err);
        reject("No results returned");
      });
  });
}

// Get students by course
function getStudentsByCourse(courseId) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: { course: courseId }
    })
    .then((students) => resolve(students))
    .catch((err) => {
      console.error("Error retrieving students by course:", err);
      reject("No results returned");
    });
  });
}

// Get student by number
function getStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: { studentNum: studentNum }
    })
    .then((students) => resolve(students[0]))
    .catch((err) => {
      console.error("Error retrieving student by number:", err);
      reject("No results returned");
    });
  });
}

// Get all courses
function getCourses() {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then((courses) => resolve(courses))
      .catch((err) => {
        console.error("Error retrieving all courses:", err);
        reject("No results returned");
      });
  });
}

// Get course by ID
function getCourseById(courseId) {
  return new Promise((resolve, reject) => {
    Course.findAll({
      where: { courseId: courseId }
    })
    .then((courses) => resolve(courses[0]))
    .catch((err) => {
      console.error("Error retrieving course by ID:", err);
      reject("No results returned");
    });
  });
}

// Add a student
function addStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (let key in studentData) {
    if (studentData[key] === "") studentData[key] = null;
  }

  return new Promise((resolve, reject) => {
    Student.create(studentData)
      .then(() => resolve())
      .catch((err) => {
        console.error("Error adding student:", err);
        reject("Unable to create student");
      });
  });
}

// Update a student
function updateStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (let key in studentData) {
    if (studentData[key] === "") studentData[key] = null;
  }

  return new Promise((resolve, reject) => {
    Student.update(studentData, {
      where: { studentNum: studentData.studentNum }
    })
    .then(() => resolve())
    .catch((err) => {
      console.error("Error updating student:", err);
      reject("Unable to update student");
    });
  });
}

// Add a course
function addCourse(courseData) {
  for (let key in courseData) {
    if (courseData[key] === "") courseData[key] = null;
  }

  return new Promise((resolve, reject) => {
    Course.create(courseData)
      .then(() => resolve())
      .catch((err) => {
        console.error("Error adding course:", err);
        reject("Unable to create course");
      });
  });
}

// Update a course
function updateCourse(courseData) {
  for (let key in courseData) {
    if (courseData[key] === "") courseData[key] = null;
  }

  return new Promise((resolve, reject) => {
    Course.update(courseData, {
      where: { courseId: courseData.courseId }
    })
    .then(() => resolve())
    .catch((err) => {
      console.error("Error updating course:", err);
      reject("Unable to update course");
    });
  });
}

// Delete a course by ID
function deleteCourseById(courseId) {
  return new Promise((resolve, reject) => {
    Course.destroy({
      where: { courseId: courseId }
    })
    .then(() => resolve())
    .catch((err) => {
      console.error("Error deleting course by ID:", err);
      reject("Unable to delete course");
    });
  });
}

// Export all functions and models
module.exports = {
  sequelize,  // Export sequelize if needed elsewhere
  Student,
  Course,
  initialize,
  getAllStudents,
  getStudentsByCourse,
  getStudentByNum,
  getCourses,
  getCourseById,
  addStudent,
  updateStudent,
  addCourse,
  updateCourse,
  deleteCourseById
};
