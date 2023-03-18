let express = require('express')
let fs = require('fs');


fs.readFile('./data/posts.json','utf8', (err, data) => {
    
})


const cors = require("cors");
let app = express()
app.use(cors());

app.post('/', (req,res) => {
    req.on('data', (data) => {
        fs.writeFile('./data/posts.json', data.toString(), (err) => {
            console.log(err);
        })
    })
    res.sendFile('C:/Users/opall/OneDrive/Рабочий стол/programming/JavaScript/3 React/project lesson/src//data/posts.json')
})
app.post('/pictures', (req,res) => {
    req.on('data', (data) => {
        fs.writeFile('./data/myPictures/photoData.json', data.toString(), (err) => {
            console.log(err);
        })
    })
})
app.get('/pictures', (req,res) => {
    res.sendFile('C:/Users/opall/OneDrive/Рабочий стол/programming/JavaScript/3 React/project lesson/src//data/myPictures/photoData.json')
})
app.get('/', (req,res) => {
    res.sendFile('C:/Users/opall/OneDrive/Рабочий стол/programming/JavaScript/3 React/project lesson/src//data/posts.json')
})
app.listen(3001, (w) => {
    console.log('w');
})