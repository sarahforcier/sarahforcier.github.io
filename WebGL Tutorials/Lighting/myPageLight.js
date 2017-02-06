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

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute); 

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
    shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
}

var cubeVertexPositionBuffer;
var cubeIndexBuffer;
var cubeVertexNormalBuffer;
var cubeTextureCoordBuffer;

function initBuffers() { //become attributes
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

	cubeVertexNormalBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	var normals = [
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0,-1.0,
		0.0, 0.0,-1.0,
		0.0, 0.0,-1.0,
		0.0, 0.0,-1.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0,-1.0, 0.0,
		0.0,-1.0, 0.0,
		0.0,-1.0, 0.0,
		0.0,-1.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		-1.0,0.0, 0.0,
		-1.0,0.0, 0.0,
		-1.0,0.0, 0.0,
		-1.0,0.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	cubeVertexNormalBuffer.itemSize = 3;
	cubeVertexNormalBuffer.numItems = 24;

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

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip coordinates so that y increases upwards (unlike usual graphics coordinates that increase as you go down)

	gl.bindTexture(gl.TEXTURE_2D, texture); 
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null); //clear
}

var numTextures = 1;
var textureImagesLoaded = 0;

var crateTexture;

function initTexture() {
	crateTexture = gl.createTexture();
	crateTexture.image = new Image(); //image field to texture object
	crateTexture.image.onload = function() {
		handleLoadedTexture(crateTexture);
		// textureImagesLoaded++;
		// if (textureImagesLoaded  >= numTextures) {
		// 	tick(); // wait to draw until image is fully loaded
		// }
	}
	crateTexture.image.src = "crate.gif";
}

var pMatrix = mat4.create(); //perspective matrix
var mvMatrix = mat4.create(); //model-view matrix (current move/rotate state)
var mvMatrixStack = []; //current state stack

function setMatrixUniforms() { //send WebGL matrix values from JavaScript
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mvMatrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -5.0;
var filter = 0;

var currentlyPressedKeys = {}; //object

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
	if (currentlyPressedKeys[33]) { // Page Up
		z -= 0.05;
	}
	if (currentlyPressedKeys[34]) { // Page Down
		z += 0.05;
	}
	if (currentlyPressedKeys[37]) { // left
		ySpeed -= 1;
	}
	if (currentlyPressedKeys[39]) { // Right
		ySpeed += 1;
	}
	if (currentlyPressedKeys[38]) { // Up
		xSpeed -= 1;
	}
	if (currentlyPressedKeys[40]) { // Down
		xSpeed += 1;
	}

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

function drawScene() {
	gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight); //lower-left x, y, width,height
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFFER_BIT);
	// (field of view angle, width-to-height ratio, z-depth near, far, perspective matrix)
	
	mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, mvMatrix, [0.0,0.0,z]);

	mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1,0,0]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0,1,0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, // pass attributes
		cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 
		cubeTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
		cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0); //can handle up to 32 textures number 0 - 31
	gl.bindTexture(gl.TEXTURE_2D, crateTexture);
	gl.uniform1i(shaderProgram.samplerUniform,0); // set to 0 to handle TEXTURE 0

	var lighting = document.getElementById("lighting").checked;
	gl.uniform1i(shaderProgram.useLightingUniform, lighting);
	if (lighting) { 
		gl.uniform3f(
			shaderProgram.ambientColorUniform, 
			parseFloat(document.getElementById("ambientR").value),
			parseFloat(document.getElementById("ambientG").value),
			parseFloat(document.getElementById("ambientB").value));

		var lightingDirection = [
			parseFloat(document.getElementById("lightDirectionX").value),
			parseFloat(document.getElementById("lightDirectionY").value),
			parseFloat(document.getElementById("lightDirectionZ").value),];
		var adjustedLD = vec3.create();
		vec3.normalize(adjustedLD, lightingDirection);
		vec3.scale(adjustedLD, adjustedLD, -1);
		gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD); // create a uniform from array

		gl.uniform3f(
			shaderProgram.directionalColorUniform,
			parseFloat(document.getElementById("directionalR").value),
			parseFloat(document.getElementById("directionalG").value),
			parseFloat(document.getElementById("directionalB").value));
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		// rPyramid += ((90 * elapsed) /1000.0) % 360 ;
		// rCube += -((75 * elapsed) /1000.0) % 360;
		xRot += (xSpeed * elapsed) / 1000.0;
		yRot += (ySpeed * elapsed) / 1000.0;
	}
	lastTime = timeNow;

}

function tick() {
	animate(); // update state
	drawScene(); // draw 
	requestAnimFrame(tick); // schedule tick to be called again
	handleKeys()
}

function webGLStart() {
	var canvas = document.getElementById("canvas1");
	initGL(canvas);
	initShaders();
	initBuffers();

	initTexture(); // tick is imbedded here



	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	
}