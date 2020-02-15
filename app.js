const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const schedule = [
    //monday
    [
        {
            "_id": 0,
            "class_name": "EO101 Lecture",
            "start_time": "8:00 am",
            "end_time": "8:55 am",
            "difficulty": "Easy"
        },
        {
            "_id": 1,
            "class_name": "EO101 Lab",
            "start_time": "9:00 am",
            "end_time": "10:55 am",
            "difficulty": "Medium"
        },
        {
            "_id": 2,
            "class_name": "MA102 Tutorial",
            "start_time": "11:00 am",
            "end_time": "11:55 am",
            "difficulty": "Very easy"
        },
        {
            "_id": 3,
            "class_name": "EO101 Tutorial",
            "start_time": "3:30 pm",
            "end_time": "4:25 pm",
            "difficulty": "Medium"
        }
    ],
    //tuesday
    [
        {
            "_id": 4,
            "class_name": "MA102 Lecture",
            "start_time": "9:30 am",
            "end_time": "11:00 am",
            "difficulty": "Very Tough"
        },
        {
            "_id": 5,
            "class_name": "CSE103 IT Workshop",
            "start_time": "1:30 pm",
            "end_time": "4:30 pm",
            "difficulty": "Tough"
        }
    ],
    //wednesday
    [
        {
            "_id": 6,
            "class_name": "EO101 Lecture",
            "start_time": "8:00 am",
            "end_time": "8:55 am",
            "difficulty": "Easy"
        },
        {
            "_id": 7,
            "class_name": "EO101 Lab",
            "start_time": "9:00 am",
            "end_time": "10:55 am",
            "difficulty": "Medium"
        },
        {
            "_id": 8,
            "class_name": "ME105 Tutorial",
            "start_time": "2:30 pm",
            "end_time": "5:30 pm",
            "difficulty": "Almost Impossible !!! (unless you are lucky)"
        }
    ],
    //thursday
    [
        {
            "_id": 9,
            "class_name": "MA102 Lecture",
            "start_time": "9:30 am",
            "end_time": "11:00 am",
            "difficulty": "Very Tough"
        },
        {
            "_id": 10,
            "class_name": "CSE103N IT Workshop",
            "start_time": "11:00 am",
            "end_time": "1:00 pm",
            "difficulty": "No attendance taken !!!"
        },
        {
            "_id": 11,
            "class_name": "H106",
            "start_time": "3:30 pm",
            "end_time": "5:30 pm",
            "difficulty": "Easy"
        }
    ],
    //friday
    [
        {
            "_id": 12,
            "class_name": "EO101 Lecture",
            "start_time": "8:00 am",
            "end_time": "8:55 am",
            "difficulty": "Easy"
        },
        {
            "_id": 13,
            "class_name": "ME104 ED",
            "start_time": "9:00 am",
            "end_time": "12:55 pm",
            "difficulty": "IMPOSSIBLE !!!"
        },
        {
            "_id": 14,
            "class_name": "H106",
            "start_time": "3:30 pm",
            "end_time": "5:30 pm",
            "difficulty": "Easy"
        }
    ]
];

//mongoose.connect("mongodb://localhost:27017/proxify", { useNewUrlParser: true, useUnifiedTopology: true });

//mongoose.connect(process.env.MONGODB_URI    , { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/proxify");

const studentSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    tokens: Number,
    to_class: [Boolean]
});

const Student = mongoose.model("Student", studentSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let students = [];

/* function nesting to avoid async execution. Earlier separated by two functions
but it leas to execution of second function first and first one later leading to error.
*/

let index = 0;

app.get('/config', (req, res) => {

    Student.find((err, temp) => {
        if (err)
            console.log("Read error");
        students = temp.slice(0);
        index = students.length;
        res.render("app", {
            students: students,
            current_class: current_class
        });
    });

});

let current_class;

app.post('/config', (req, res) => {
    let button_choice = req.body.button;
    if (button_choice == 'add-student') {

        const new_student = new Student({
            _id: index++,
            name: req.body.new_student_name,
            tokens: Number(req.body.tokens),
            to_class: new Array(15).fill(false)
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
                let is_in_class = false;
                for (let j = 0; j < req.body.to_class.length; j++) {
                    if (req.body.to_class[j] == i)
                        is_in_class = true;
                }
                let update_class = { "$set": {} };
                update_class["$set"]["to_class." + current_class] = is_in_class;
                Student.updateOne({ _id: i }, update_class, (err) => { });
            }
            res.redirect('/proxy');
        });
    }
    else if (button_choice == 'clear-all') {
        Student.remove({}, (err) => { });
        res.redirect('/config');
    }
});

let to_class = [];
let proxy = [];

app.get('/proxy', (req, res) => {
    to_class = [];
    proxy = [];
    Student.find((err, temp) => {
        if (err)
            console.log("Read error");
        students = temp.slice(0);
        for (let i = 0; i < students.length; i++) {
            if (students[i].to_class[current_class])
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
        });
        let min = Math.min(to_class.length, proxy.length);
        proxy = proxy.slice(0, min);
        to_class = to_class.slice(0, min);
        res.render("proxy", {
            to_class: to_class,
            proxy: proxy
        });
    });
});

app.post('/proxy', (req, res) => {
    let proxy_done = req.body.proxy_done;
    for (let i = 0; i < proxy.length; i++) {
        let left_id = to_class[i]._id;
        let right_id = proxy[i]._id;
        Student.updateOne({ _id: left_id }, { $inc: { tokens: 1 } }, (err) => {
            if (err)
                console.log("Update error");
        });
        Student.updateOne({ _id: right_id }, { $inc: { tokens: -1 } }, (err) => {
            if (err)
                console.log("Update error");
        });
    }
    res.redirect('/root');
});

app.listen(port, () => {
    console.log('App listening');
});

app.get('/root', (req, res) => {
    let date = new Date().toLocaleDateString("en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    res.render("class", {
        date: date,
        today: schedule[Math.min((new Date().getDay() + 6) % 7, 4)]
    });
});

app.post('/root', (req, res) => {
    current_class = Number(req.body.class);
    res.redirect('/config');
});

app.get('/leader', (req, res) => {
    Student.find((err, temp) => {
        if (err)
            console.log("Read error");
        students = temp.slice(0);

        temp.sort((a, b) => {
            if (a.tokens < b.tokens)
                return 1;
            if (a.tokens > b.tokens)
                return -1;
            return 0;
        });

        res.render("leader", {
            ranks: temp,
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.post('/', (req, res) => {
    res.redirect('/root');
});