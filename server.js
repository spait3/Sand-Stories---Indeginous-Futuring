
// export REPLICATE_API_TOKEN=




//------------------
import express from 'express';
import Replicate from 'replicate';
import { Server } from 'socket.io';
import { Buffer } from 'buffer';
import { data } from '@tensorflow/tfjs';

let drawingAr=[];

const app = express();
const server = app.listen(3000);

const io = new Server(server);

app.use(express.static('public'));

console.log('My Socket server is running');

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('label', (dataUrl) => {
    console.log(`Received image from client: ${socket.id}`);

    // Remove the "data:image/png;base64," prefix from the dataUrl
    console.log("label received is" + dataUrl);
    console.log(dataUrl);
    if ((dataUrl=="nothing") || (dataUrl=="hand")){
      console.log("didn't add");
    }
    else if (dataUrl==drawingAr[-1]){
      console.log("repeat");
    }
    else{
    drawingAr.push(dataUrl);
    }

    let prompt = "Imagining indigenous futurism of ";

    for (let i = 0; i < drawingAr.length; i++) {
      prompt += drawingAr[i];
  if (i < drawingAr.length - 1) {
    prompt += ", ";
  } else {
    prompt += ".";
  }
}
 console.log(prompt);
 
    // Call the Replicate API
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    replicate.run(
			"stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
			{
				input: {
					prompt: prompt
				}
			}
		).then((output) => {
			console.log('Received output from Replicate API:', output);
			// Send output back to client (optional)
			socket.emit('output', output);
		}).catch((error) => {
			console.error('Error calling Replicate API:', error);
		});
  });






















// import express from 'Express';
// import Replicate from 'replicate';
// import {Server, Socket} from 'socket.io'; 



// console.log("Ho gya load");



// const io = new Server(server);

// var app = express();
// var server = app.listen(3000);

// app.use(express.static('public'));

// console.log("My Socket server is running");


// //socket init

// //var socket = require('socket.io');

// //var io = socket(server);
// console.log("Check");
// io.on('connection', newConnection);

// function newConnection(socket){
// 	console.log(socket.id);
// 	socket.on('image', hihi);


// 	//Socket Code Ends
// function hihi(){
// 	console.log("some");
//   }

// console.log("api authentication");
// }









})
