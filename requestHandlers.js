var querystring = require("querystring"),
		fs = require("fs"),
		formidable = require("formidable"),
		mongoose = require('mongoose');

// First experience with mongoose 
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
var File;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {

	var fileSchema = mongoose.Schema({ // Schema - ??
		name: String,
		img: {data: Buffer, contentType: String },
		date: Date
	});

	File = mongoose.model('File', fileSchema) // Model - Class

});

function start(response) {
	console.log("Request handler 'start' was called.");

	var body = '<html>' +
	'<head>'+
	'<meta http-equiv="Content-Type" content="text/html; '+
	'charset=UTF-8" />'+
	'</head>'+
	'<body>'+
	'<form action="/upload" enctype="multipart/form-data" method="post">'+
	'<input type="file" name="upload">'+
	'<input type="submit" value="Upload file" />'+
	'</form>'+
	'</body>'+
	'</html>';

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
}

function upload(response, request) {
	console.log("Request handler 'upload' was called.");
	
	var form = new formidable.IncomingForm();

	console.log("about to parse");

	form.on('file', function(field, file) {
		var someImage = new File( { name: file.name } );
		someImage.img.contentType = file.type;
		someImage.img.data = file.path;
		someImage.date = Date.now();
		someImage.save(function (err, someImage) {
			if (err) { } // do smth
			console.log("Image saved: " + someImage.name);
		});
	});

	form.parse(request, function(error, fields, files) {
		console.log("parsing done");
		fs.rename(files.upload.path, "./tmp/" + files.upload.name);
	});

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("received image: <br/>");
	response.write("<img src='/show' />");
	response.end();
}

function show(response) {
	console.log("Request handler 'show' was called.");
	
	File.findOne({}, {}, { sort: { 'date' : -1 } }, function(err, file) {
		if (err) { } // do smth
		console.log(file);
		response.writeHead(200, {"Content-Type": "image/png"});
		fs.createReadStream("./tmp/" + file.name).pipe(response);
	});
	
}

exports.start = start;
exports.upload = upload;
exports.show = show;
