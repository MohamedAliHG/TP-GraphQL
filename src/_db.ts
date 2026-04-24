const users = [
    {
        id: "1",
        name: "Med",
        email: "med@gmail.com",
        role: "ADMIN"
    },
    {
        id: "2",
        name: "Sami",
        email: "sami@gmail.com",
        role: "USER"
    },
    {
        id: "3",
        name: "Yazid",
        email: "yazid@gmail.com",
        role: "USER"
    },
    {
        id: "4",
        name: "Ali",
        email: "ali@gmail.com",
        role: "USER"
    }
]


const skills = [
    {
        id: "1",
        Designation: "JS"
    },
    {
        id: "2",
        Designation: "TS"
    },
    {
        id: "3",
        Designation: "Python"
    },
    {
        id: "4",
        Designation: "Java"
    }
]

const cvs = [
    {
        id: "1",
        name: "CV Med",
        Age: 22,
        Job: "Fullstack Developer",
        skillsId: ["4", "1"],
        UserId: "1"
    },
    {
        id: "2",
        name: "CV Sami",
        Age: 25,
        Job: "Backend Developer",
        skillsId: ["1", "2"],
        UserId: "2"
    },
    {
        id: "3",
        name: "CV Yazid",
        Age: 30,
        Job: "Data Scientist",
        skillsId: ["2", "3"],
        UserId: "3"
    },
    {
        id: "4",
        name: "CV Ali",
        Age: 28,
        Job: "Frontend Developer",
        skillsId: ["4", "3"],
        UserId: "4"
    }
]

export default{ users, skills, cvs }