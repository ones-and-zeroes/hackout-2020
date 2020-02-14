const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/proxify", { useNewUrlParser: true, useUnifiedTopology: true });

const studentSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    tokens: Number,
    to_class: Boolean
});

const Student = mongoose.model("Student", studentSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let students = [];

/* function nesting to avoid async execution. Earlier separated by two functions
but it leas to execution of second function first and first one later leading to error.
*/

app.get('/config', (req, res) => {

    Student.find((err, temp) => {
        if (err)
            console.log("Read error");
        students = temp.slice(0);
        res.render("app", {
            students: students
        });
    });

});

let index = 0;

app.post('/config', (req, res) => {
    let button_choice = req.body.button;
    if (button_choice == 'add-student') {

        const new_student = new Student({
            _id: index++,
            name: req.body.new_student_name,
            tokens: 0,
            to_class: false
        });

        new_student.save();

        res.redirect('/config');
    }
    else if (button_choice == 'generate-proxy') {

        Student.find((err, temp) => {
            if (err)
                console.log("Read error");
            students = temp.slice(0);
            for (let i = 0; i < students.length; i++) {
                Student.updateOne({ _id: i }, { to_class: (req.body.to_class.includes(i)) }, (err) => {
                    console.log(req.body.to_class.includes(i));
                });
            }
            res.redirect('/proxy');
        });
    }
    else if (button_choice == 'clear-all') {
        Student.remove({}, (err) => { });
        res.redirect('/config');
    }
});

app.get('/proxy', (req, res) => {
    Student.find((err, temp) => {
        if (err)
            console.log("Read error");
        students = temp.slice(0);
        let to_class = [];
        let proxy = [];
        for (let i = 0; i < students.length; i++) {
            if (students[i].to_class)
                to_class.push(students[i]);
            else
                proxy.push(students[i]);
        }
        proxy.sort((a, b) => {
            if (a.tokens < b.tokens)
                return 1;
            if (a.tokens > b.tokens)
                return -1;
            return 0;
        })
        res.render("proxy", {
            to_class: to_class,
            proxy: proxy
        });
    });
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});