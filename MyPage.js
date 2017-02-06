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

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

var starVertexPositionBuffer;
var starTextureCoordBuffer;

function initBuffers() { //become attributes
	starVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, starVertexPositionBuffer);
	vertices = [ //needs repeated to get solid color sides
		-1.0,-1.0,0.0,
		1.0,-1.0,0.0,
		-1.0,1.0,0.0,
		1.0,1.0,0.0,
     ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	starVertexPositionBuffer.itemSize = 3;
	starVertexPositionBuffer.numItems = 4;

	starTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, starTextureCoordBuffer);
    var texCoord = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
	starTextureCoordBuffer.numItems = 4;
	starTextureCoordBuffer.itemSize = 2;
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip coordinates so that y increases upwards (unlike usual graphics coordinates that increase as you go down)

	gl.bindTexture(gl.TEXTURE_2D, texture); 
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	gl.bindTexture(gl.TEXTURE_2D, null); //clear
}

var numTextures = 1;
var textureImagesLoaded = 0;

var starTexture;

function initTexture() {
	starTexture = gl.createTexture();
	starTexture.image = new Image(); //image field to texture object
	starTexture.image.onload = function() {
		handleLoadedTexture(starTexture);
		// textureImagesLoaded++;
		// if (textureImagesLoaded  >= numTextures) {
		// 	tick(); // wait to draw until image is fully loaded
		// }
	}
	starTexture.image.src = "star.gif";
}

var pMatrix = mat4.create(); //perspective matrix
var mvMatrix = mat4.create(); //model-view matrix (current move/rotate state)
var mvMatrixStack = []; //current state stack

function setMatrixUniforms() { //send WebGL matrix values from JavaScript
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var currentlyPressedKeys = {}; //object

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

var zoom = -15;
var tilt = 90;
var spin = 0;

function handleKeys() {
	if (currentlyPressedKeys[33]) { // Page Up
		zoom -= 0.1;
	}
	if (currentlyPressedKeys[34]) { // Page Down
		zoom += 0.1;
	}
	if (currentlyPressedKeys[38]) { // Up
		tilt += 2;
	}
	if (currentlyPressedKeys[40]) { // Down
		tilt -= 2;
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

function drawStar() {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, starTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, starTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, starTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, starVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, starVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, starVertexPositionBuffer.numItems);
}

function Star(startingDistance, rotationSpeed) {
	this.angle = 0;
	this.dist = startingDistance;
	this.rotationSpeed = rotationSpeed;
	this.randomiseColors();
}

Star.prototype.draw = function (tilt, spin, twinkle) {
	mvPushMatrix();

	mat4.rotate(mvMatrix, mvMatrix, degToRad(this.angle), [0.0,1.0,0.0]);
	mat4.translate(mvMatrix, mvMatrix, [this.dist, 0.0, 0.0]);

	mat4.rotate(mvMatrix, mvMatrix, degToRad(-this.angle), [0.0,1.0,0.0]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(-tilt), [1.0,0.0,0.0]);

	if (twinkle) {
		gl.uniform3f(shaderProgram.colorUniform, this.twinkleR, this.twinkleG, this.twinkleB);
		drawStar();
	}

	mat4.rotate(mvMatrix, mvMatrix, degToRad(spin), [0.0,0.0,1.0]);
	gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);
	drawStar();

	mvPopMatrix();
};

var effectiveFPMS = 60/1000;
Star.prototype.animate = function (elapsedTime) {
	// angle: far around orbit of the center of the scene
	this.angle += this.rotationSpeed * effectiveFPMS * elapsedTime;
	this.dist -= 0.01 * effectiveFPMS * elapsedTime;
	if (this.dist < 0.0) {
		this.dist += 5.0; 
		this.randomiseColors();
	}
};

Star.prototype.randomiseColors = function() {
	this.r = Math.random();
	this.g = Math.random();
	this.b = Math.random();
	this.twinkleR = Math.random();
	this.twinkleB = Math.random();
	this.twinkleG = Math.random();

};

var stars = [];

function initWorldObjects() {
	var numStars = 50;
	for (var i=0; i<numStars; i++) {
		stars.push(new Star((i/numStars)*5.0, i/numStars));
	}
}

function drawScene() {
	gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight); //lower-left x, y, width,height
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFFER_BIT);
	// (field of view angle, width-to-height ratio, z-depth near, far, perspective matrix)
	
	mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0.0,0.0,zoom]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(tilt), [1.0,0.0,0.0]);
	
	var twinkle = document.getElementById("twinkle").checked;

	for (var i in stars) {
		stars[i].draw(tilt, spin, twinkle);
		spin += 0.1;
	}
}

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		for (var i in stars) {
			stars[i].animate(elapsed);
		}
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
	initTexture(); 
	initBuffers();
	initWorldObjects();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}