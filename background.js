const vertexShaderSource = `#version 300 es
void main() {
    vec2 uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(uv * vec2(2, -2) + vec2(-1, 1), 0, 1);
}
`;
 
const fragmentShaderSource = `#version 300 es
precision highp float;
 
out vec4 outColor;

// Integer Hash - III
// - Inigo Quilez, Integer Hash - III, 2017
//   https://www.shadertoy.com/view/4tXyWN
uint uhash12(uvec2 x) {
    uvec2 q = 1103515245U * ( (x>>1U) ^ (x.yx   ) );
    uint  n = 1103515245U * ( (q.x  ) ^ (q.y>>3U) );
    return n;
}

void main() {
    vec2 p = gl_FragCoord.xy;
    uint r = uhash12(uvec2(p));
    float v = float(r >> 16) / float(1 << 16);
    outColor = vec4(v, v, v, 1);
}
`;


function makeBasicTexture(gl, format, type, width, height) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const level = 0;
    const internalFormat = format;
    const border = 0;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border,
                format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
}




var renderWidth, renderHeight;
var simWidth, simHeight;
var simFrontTex;
var simBackTex;

var simFrontFB;
var simBackFB;

function onResize(canvas, gl) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const dpr = window.devicePixelRatio;
    const displayWidth  = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);
    renderHeight = displayHeight;
    renderWidth = displayWidth;
    simWidth = Math.round(displayWidth / 24);
    simHeight = Math.round(displayHeight / 24);

    simFrontTex = makeBasicTexture(gl, gl.RGBA, gl.UNSIGNED_BYTE, simWidth, simHeight);
    simBackTex = makeBasicTexture(gl, gl.RGBA, gl.UNSIGNED_BYTE, simWidth, simHeight);
    
    simFrontFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, simFrontFB);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, 
        gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, 
        simFrontTex, 
        0
    );

    simBackFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, simFrontFB);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, 
        gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, 
        simFrontTex, 
        0
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Check if the canvas is not the same size.
    const needResize = canvas.width  != displayWidth || 
                        canvas.height != displayHeight;
    
    if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
    }
    
    return needResize;
}
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}





function draw() {
    const canvas = document.getElementById("mainCanvas");
    if (canvas.getContext) {
        var gl = canvas.getContext("webgl2");
        if (!gl) {
            return;
        }
        onResize(canvas, gl);

        var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        var program = createProgram(gl, vertexShader, fragmentShader);
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

window.addEventListener("load", draw);