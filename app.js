const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const multer = require('multer');
const {spawn} = require('child_process');

//Upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/upload');
     },
    filename: function (req, file, cb) {
        cb(null , file.fieldname + '-' + Date.now() + '.png');
    }
});
var upload = multer({ storage: storage })

// Load View Engine
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'pug');

//Router
router.get('/', function(req,res){
	res.render('index');
});

router.route("/result")
	.post(upload.single("img-upload"), function(req, res){
		try {
			//res.send(req.file['path']);
			imgPath = req.file['path'].toString();
			imgName = req.file['filename'].toString();
			var dataToSend;
			const python = spawn('python', ['python/hello.py', imgPath]);
			python.stdout.on('data', function (data) {
				console.log('Pipe data from python script ...');
				dataToSend = data.toString();
				console.log("OUT: " + data);
			});
			python.stderr.on('data', function(data) {
		    	console.error(data.toString());
			});
			python.on('close', (code) => {
				console.log(`child process close all stdio with code ${code}`);
				// send data to browser
				//res.send(dataToSend);
				res.render('result', {test: 'output/' + imgName, print_o: dataToSend});
			});
		}catch(err) {
			res.send(400);
		}
	});

//add the router
app.use('/', router);
app.use(express.static(__dirname + '/public'));
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');