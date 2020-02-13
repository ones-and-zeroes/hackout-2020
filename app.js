const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let students = [
    {
        name: "Shreyansh",
        tokens: 10,
        to_class: false
    },
    {
        name: "Sharabh",
        tokens: 1,
        to_class: false
    },
    {
        name: "Saumaya",
        tokens: 2,
        to_class: false
    }
];

app.get('/config', (req, res) => {
    res.render("app", {
        students: students
    });
});

app.post('/config', (req, res) => {
    console.log(req.body);
    let button_choice = req.body.button;
    if (button_choice == 'add-student') {
        students.push({
            name: req.body.new_student_name,
            tokens: 0
        });
        res.redirect('/config');
    }
    else if (button_choice == 'generate-proxy') {
        console.log(req.body.to_class);
        for (let i = 0; i < req.body.to_class.length; i++) {
            students[i].to_class = true;
        }
        res.redirect('/proxy');
    }
});

app.get('/proxy', (req, res) => {
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

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});