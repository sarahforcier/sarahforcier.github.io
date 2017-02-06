/* WebGL commands
	createBuffer: initialize 
	createTexture: initialize
	bindBuffer: set current buffer
	bufferData: add data to buffer
	attachShader:
	viewportWidth:
	viewportHeight:
	viewport:
	clear:
	vertexAttribPointer:
	drawArrays: draw vertices in current buffer
	shaderSource: assign shader code
*/
/* 	GPU variables
	const: constant
	attribute: global variable change per vertex (for vertex shader)
	uniform: global variable change per primitive (for vertex and fragment shader)
	varying: interpolated datat between vertex and fragment shader
*/
var gl; //WebGL context, retreived from canvas

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch(e) {
		alert("Could not initialise WebGL");
	} 
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id); // script defined in HTML
	if (!shaderScript) { // not null
		return null;
	}

	var str = ""; // shader code
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) str += k.textContent; // if text node
		k = k.nextSibling;
	}

	var shader; 
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram(); //program lives on graphics card
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	// get a reference to attributes passed to vertex shader
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); //values provided by array

	// shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	// gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute); 

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

// var pyramidVertexPositionBufSfer;
// var pyramidVertexColorBuffer;
// var pyramidIndexBuffer;

var cubeVertexPositionBuffer;
// var cubeVertexColorBuffer;
var cubeIndexBuffer;
var cubeTextureCoordBuffer;

function initBuffers() { //become attributes
	// pyramidVertexPositionBuffer = gl.createBuffer();
	// //set current array buffer
	// gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer); 
	// var vertices = [
	// 	0.0, 1.0, 0.0, //1
	// 	-1.0,-1.0,-1.0, //9
	// 	-1.0,-1.0,1.0, //2
	// 	1.0,-1.0, 1.0, //3
	// 	1.0,-1.0, -1.0]; //6
	// // fill current buffer with new array of vertices
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	// pyramidVertexPositionBuffer.itemSize = 3;
	// pyramidVertexPositionBuffer.numItems = 5;

	// pyramidVertexColorBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	// var colors = [
	// 	1.0, 0.0, 0.0, 1.0,
	// 	0.0, 0.0, 1.0, 1.0,
	// 	0.0, 1.0, 0.0, 1.0,
	// 	0.0, 0.0, 1.0, 1.0,
	// 	0.0, 1.0, 0.0, 1.0
	// 	];
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	// pyramidVertexColorBuffer.itemSize = 4;
	// pyramidVertexColorBuffer.numItems = 5;

	// pyramidIndexBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
	// var indices = [
	// 	 0,1,2,
	// 	 0,2,3,
	// 	 0,3,4,
	// 	 0,4,1,
	// 	 3,2,1,
	// 	 1,4,3];
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	// pyramidIndexBuffer.numItems = 18; 

	// repeat for square
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [ //needs repeated to get solid color sides
      -1.0, -1.0,  1.0,  // Front face
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0, -1.0, // Back face
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0, // Top face
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      -1.0, -1.0, -1.0, // Bottom face
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
       1.0, -1.0, -1.0, // Right face
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0, // Left face
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
     ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	// cubeVertexColorBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	// colors = [
 //      [1.0, 0.0, 0.0, 1.0],     // Front face
 //      [1.0, 1.0, 0.0, 1.0],     // Back face
 //      [0.0, 1.0, 0.0, 1.0],     // Top face
 //      [1.0, 0.5, 0.5, 1.0],     // Bottom face
 //      [1.0, 0.0, 1.0, 1.0],     // Right face
 //      [0.0, 0.0, 1.0, 1.0],     // Left face
 //    ];
 //    var unpackedColors = [];
 //    for (var i in colors) {
 //      var color = colors[i];
 //      for (var j=0; j < 4; j++) {
 //        unpackedColors = unpackedColors.concat(color);
 //      }
 //    }
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
	// cubeVertexColorBuffer.itemSize = 4;
	// cubeVertexColorBuffer.numItems = 24;

	cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	indices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	cubeIndexBuffer.numItems = 36; 

	cubeTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureCoordBuffer);
	var face = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
	var texCoord = [];  // per vertex attribute
	for (var i = 0; i< 6; i++) {
		texCoord = texCoord.concat(face);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
	cubeTextureCoordBuffer.numItems = 24;
	cubeTextureCoordBuffer.itemSize = 2;
}

var neheTexture;

function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture); // set current texture (like bindBuffer)
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip coordinates so that y increases upwards (unlike usual graphics coordinates that increase as you go down)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // upload image to graphics card
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // how to scale up
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // how to scale down
	gl.bindTexture(gl.TEXTURE_2D, null); // clear upp
}

	var numTextures = 1;
	var textureImagesLoaded = 0;

function initTexture() {

	neheTexture = gl.createTexture();
	neheTexture.image = new Image(); //image field to texture object
	neheTexture.image.onload = function() { // callback function when texture is loaded
		handleLoadedTexture(neheTexture);
		textureImagesLoaded++;
		if (textureImagesLoaded  >= numTextures) {
			tick(); // wait to draw until image is fully loaded
		}
	};
	// need to open chrome with --allow-file-access-from-files
	neheTexture.image.src = "ombre.gif"; // must be power of 2 images
}

var pMatrix = mat4.create(); //perspective matrix
var mvMatrix = mat4.create(); //model-view matrix (current move/rotate state)
var mvMatrixStack = []; //current state stack

function setMatrixUniforms() { //send WebGL matrix values from JavaScript
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.copy(copy, mvMatrix);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix";
	}
	mvMatrix = mvMatrixStack.pop();
}

function degToRad(deg) {
	return Math.PI * deg / 180;
}

// var rPyramid = 0; // triangle rotation
// var rCube = 0; // square rotation
var xRot = 0;
var yRot = 0;
var zRot = 0;

function drawScene() {
	gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight); //lower-left x, y, width,height
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFFER_BIT);
	// (field of view angle, width-to-height ratio, z-depth near, far, perspective matrix)
	
	mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mat4.identity(mvMatrix);

	// move to where triangle is drawn and draw
	// mat4.translate(mvMatrix, mvMatrix, [-1.5,1.0,-10.0]);

	// mvPushMatrix(); //save matrix
	// mat4.rotate(mvMatrix, mvMatrix, degToRad(rPyramid), [1,0,0]);

	// gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer); // set current buffer
	// gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
	// 	pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
	// 	pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
	// setMatrixUniforms(); //moves to graphics card
	// gl.drawElements(gl.TRIANGLES, pyramidIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0); // draw vertices from index 0 to numItems
	
	// mvPopMatrix(); //restore saved matrix

	// draw square
	// mat4.translate(mvMatrix, mvMatrix, [3.0,-1.0, 0.0]); //relative to previous position
	
	// mvPushMatrix();
	// mat4.rotate(mvMatrix, mvMatrix, degToRad(rCube), [1,1,1]);

	mat4.translate(mvMatrix, mvMatrix, [0.0,0.0,-5.0]);

	mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1,0,0]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0,1,0]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(zRot), [0,0,1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, // draw
		cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
	// 	cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 
		cubeTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0); //can handle up to 32 textures number 0 - 31
	gl.bindTexture(gl.TEXTURE_2D, neheTexture);
	gl.uniform1i(shaderProgram.samplerUniform,0); // set to 0 to handle TEXTURE 0

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	// mvPopMatrix();
}

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		// rPyramid += ((90 * elapsed) /1000.0) % 360 ;
		// rCube += -((75 * elapsed) /1000.0) % 360;
		xRot += (90 * elapsed) / 1000.0;
		yRot += (90 * elapsed) / 1000.0;
		zRot += (90 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

function tick() {
	animate(); // update state
	drawScene(); // draw 
	requestAnimFrame(tick); // schedule tick to be called again
}

function webGLStart() {
	var canvas = document.getElementById("canvas1");
	initGL(canvas);
	initShaders();
	initBuffers();
	initTexture();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
}