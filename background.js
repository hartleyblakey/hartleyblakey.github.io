const vertexShaderSource = `#version 300 es
void main() {
    vec2 uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(uv * vec2(2, -2) + vec2(-1, 1), 0, 1);
}
`;
 
const fragmentShaderSource = `#version 300 es
precision highp float;
 
out vec4 outColor;

uniform vec2 uRes;
uniform vec2 uSimRes;
uniform uint uFrame;
uniform float uTime;
uniform float uTimeStep;
uniform float uTick;
uniform sampler2D uLast;

// pixel pos, lmb, reserved
uniform vec4 uMouse;

// vis specific uniforms
uniform float uSubTick;
uniform sampler2D uCurrent;


// Integer Hash - III
// - Inigo Quilez, Integer Hash - III, 2017
//   https://www.shadertoy.com/view/4tXyWN
uint uhash12(uvec2 x) {
    uvec2 q = 1103515245U * ( (x>>1U) ^ (x.yx   ) );
    uint  n = 1103515245U * ( (q.x  ) ^ (q.y>>3U) );
    return n;
}


float getDepth(uvec2 tile) {
    vec4 c = texelFetch(uLast, ivec2(tile), 0);
    if (c.r > 0.5) {
        // alive
        return 0.0;
    } else {
        // dead 
        return c.y + 0.001;
    }
}

void main() {
    vec2 p = gl_FragCoord.xy;
    p *= 0.9;
    p += uRes * 0.05;
    vec2 uv = p / uRes;
    vec2 tile = uv * uSimRes;

    // vec2 dir = -(uMouse.xy / uRes - 0.5) * 3.0;
    // float d = 0.99;
    // for (float t = 0.9; t > 0.0; t -= 0.0999) {
    //     float nd = getDepth(uvec2(tile));
    //     if (nd < t) {
    //         d = t;
    //     }
    //     p += dir * 4.0;
    //     uv = p / uRes;
    //     tile = uv * uSimRes;
    // }
    


    vec3 col = vec3(0);

//     uint r = uhash12(uvec2(p) + uvec2(uFrame * 2222u));
//     float v = float(r >> 16) / float(1 << 16);
    
//     outColor = vec4(v, v, fract(uTime / uTimeStep), 1);
//     vec4 next = texelFetch(uLast, ivec2(tile), 0);
//     vec4 current = texelFetch(uCurrent, ivec2(tile), 0);

//     float fac = float(uhash12(uvec2(tile)) >> 16) / float(1u << 16);
//     fac = 1.0;
//     vec4 val = mix(current, next, step(fac, uSubTick));
//     v = val.r;
//     float timeAlive = val.z;
//     float timeDead = val.y;
//    // v = 1.0 -  step(v, 0.1);
//     outColor.rgb = vec3(v);
//     outColor.rgb *= mix(vec3(0.6,0.6,0.3), vec3(0,1,0), texelFetch(uCurrent, ivec2(tile), 0).z);

//     if (v > 0.5) {
//         // alive
//         col = mix(vec3(0.5, 1.0, 0.5), vec3(0.3, 0.6, 0.3), sqrt(timeAlive));
//     } else {
//         // dead 
//         col = mix(vec3(0.1, 0.2, 0.1), vec3(0.1, 0.1, 0.1), timeDead);
//     }
    

    $VISUALIZATION$

    outColor = vec4(col, 1.0);
}
`;


const vertSourceSim = `#version 300 es
void main() {
    vec2 uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(uv * vec2(2, -2) + vec2(-1, 1), 0, 1);
}
`;
 
const fragSourceSim = `#version 300 es
precision highp float;
 
out vec4 outColor;

uniform vec2 uRes;
uniform vec2 uSimRes;
uniform uint uFrame;
uniform float uTime;
uniform float uTimeStep;
uniform uint uTick;
uniform sampler2D uLast;

// Integer Hash - III
// - Inigo Quilez, Integer Hash - III, 2017
//   https://www.shadertoy.com/view/4tXyWN
uint uhash12(uvec2 x) {
    uvec2 q = 1103515245U * ( (x>>1U) ^ (x.yx   ) );
    uint  n = 1103515245U * ( (q.x  ) ^ (q.y>>3U) );
    return n;
}

vec4 glider(uvec2 wp) {
    uvec2 p = wp & uvec2(3u);
    if (p.x == 3u || p.y == 3u) {
        return vec4(0, 0, 0, 1);
    }
    if (p.y == 2u || p.y == p.x - 1u) {
        return vec4(1, 0, 0, 1);
    }
    
    return vec4(0, 0, 0, 1);

}



void main() {
    vec2 p = gl_FragCoord.xy;
    
    uint rnd = uhash12(uvec2(p) + uFrame);
    float v = float(rnd >> 16) / float(1 << 16);
    outColor = vec4(v, v, fract(uTime / uTimeStep), 1);
    v = step(v, 0.1);
    vec4 last = texelFetch(uLast, ivec2(p), 0);

    float l = texelFetch(uLast, ivec2(p) + ivec2(-1, +0), 0).r;
    float r = texelFetch(uLast, ivec2(p) + ivec2(+1, +0), 0).r;
    float u = texelFetch(uLast, ivec2(p) + ivec2(+0, +1), 0).r;
    float d = texelFetch(uLast, ivec2(p) + ivec2(+0, -1), 0).r;

    float ll = texelFetch(uLast, ivec2(p) + ivec2(-1, -1), 0).r;
    float lr = texelFetch(uLast, ivec2(p) + ivec2(+1, -1), 0).r;
    float ul = texelFetch(uLast, ivec2(p) + ivec2(-1, +1), 0).r;
    float ur = texelFetch(uLast, ivec2(p) + ivec2(+1, +1), 0).r;

    float total = l + r + u + d + ll + lr + ul + ur;



    if (total > 2.5 && total < 3.5 && last.r < 0.5) {
        // born
        outColor = vec4(1, 0, 0, 1.0);
    } else if ((total < 1.5 || total > 3.5) && last.r > 0.5) {
        // die
        outColor = vec4(0, 0, 0.0, 1.0);
    } else {
        // maintain
        outColor.rgb = last.rgb + vec3(0, 1.0 / 255.0, 1.0 / 255.0);
    }
    
    // init
    if (last.a < 0.5) {
       outColor = vec4(0, 1, 0, 1.0);
    }

    if (p.y < 1.0 + mod(p.x, 4.0) * 0.3 * mod(p.y, 5.0) ) {
        //outColor = vec4(1, 0, 0, 1.0);
    }

    uvec2 gliderPos = uvec2(p) >> 2;
    uint gliderHash = uhash12(gliderPos);
    if (uTick % 32u == gliderHash % 53u && gliderPos.y < 1u) {
        if (uTick % 3u == 0u) {
            p.y = uRes.y - p.y;
        }
        outColor = glider(uvec2(p));
    }

    //outColor.rgb = vec3(v);
}
`;


const defaultVisualization = `
    // returns 0.0 for alive tiles, approaching 1 the longer the tile has been dead
    float d = getDepth(uvec2(tile));
    d = ceil(d * 12.0 - 0.02) / 16.0;

    // green
    vec3 liveCol = vec3(0.5, 1.0, 0.5);
    vec3 deadCol = vec3(0.3, 0.6, 0.3);

    col = (1.0 - d) * (1.0 - d) * deadCol;
    
    if (d < 0.01) {
        col = liveCol;
    }
`


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

var visualization = defaultVisualization;

var gl;
var programVis;
var programSim;
var vao;
var currentFrame = 0;
var currentTick = 0;
var timeStep = 0.1;
var programLoadTime = Date.now() / 1000;

var visWidth, visHeight;
var simWidth, simHeight;
var simFrontTex;
var simBackTex;

var mouseX;
var mouseY;

var simFrontFB;
var simBackFB;

function onResize() {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const dpr = window.devicePixelRatio;
    const displayWidth  = Math.round(gl.canvas.clientWidth * dpr);
    const displayHeight = Math.round(gl.canvas.clientHeight * dpr);
    visHeight = displayHeight;
    visWidth = displayWidth;
    simWidth = Math.ceil(gl.canvas.clientWidth / 8);
    simHeight = Math.ceil(gl.canvas.clientHeight / 8);

    simFrontTex = makeBasicTexture(gl, gl.RGBA, gl.UNSIGNED_BYTE, simWidth, simHeight);
    simBackTex = makeBasicTexture(gl, gl.RGBA, gl.UNSIGNED_BYTE, simWidth, simHeight);
    
    simFrontFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, simFrontFB);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, 
        gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, 
        simFrontTex, 
        null
    );

    simBackFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, simBackFB);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, 
        gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, 
        simBackTex, 
        null
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Check if the canvas is not the same size.
    const needResize = gl.canvas.width  != displayWidth || 
                        gl.canvas.height != displayHeight;
    
    if (needResize) {
        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    
    return needResize;
}
function createShader(type, source) {
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

function createProgram(vertexShader, fragmentShader) {
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

function updatePrograms() {
    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource.replace("$VISUALIZATION$", visualization));
    programVis = createProgram(vertexShader, fragmentShader);


    var vertexShader = createShader(gl.VERTEX_SHADER, vertSourceSim);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragSourceSim);
    programSim = createProgram(vertexShader, fragmentShader);
}


function updateUniforms(program) {
    var frameLoc = gl.getUniformLocation(program, "uFrame");
    var timeLoc = gl.getUniformLocation(program, "uTime");
    var timeStepLoc = gl.getUniformLocation(program, "uTimeStep");
    var lastLoc = gl.getUniformLocation(program, "uLast");
    var resLoc = gl.getUniformLocation(program, "uRes");
    var simResLoc = gl.getUniformLocation(program, "uSimRes");
    var tickLoc = gl.getUniformLocation(program, "uTick");
    var mouseLoc = gl.getUniformLocation(program, "uMouse");

    gl.uniform1f(timeLoc, Date.now() / 1000.0 - programLoadTime);
    gl.uniform1f(timeStepLoc, timeStep);
    gl.uniform1ui(frameLoc, currentFrame);
    gl.uniform1ui(tickLoc, currentTick);

    gl.uniform2f(resLoc, visWidth, visHeight);
    gl.uniform2f(simResLoc, simWidth, simHeight);
    gl.uniform4f(mouseLoc, mouseX, mouseY, 0.0, 0.0);

    var unit = 0;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, simFrontTex);
    gl.uniform1i(lastLoc, unit);
    
}

function tick() {
    gl.useProgram(programSim);
    gl.viewport(0, 0, simWidth, simHeight);
    updateUniforms(programSim);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    

    gl.bindFramebuffer(gl.FRAMEBUFFER, simBackFB);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    currentTick += 1;

    // reset back to screen rendering
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // swap front and back buffers
    [simFrontTex, simBackTex] = [simBackTex, simFrontTex];
    [simFrontFB, simBackFB] = [simBackFB, simFrontFB];
}

var lastFrameTime = Date.now() / 1000;
function draw() {
    let expectedTicks = (Date.now() / 1000 - programLoadTime) / timeStep + 255;
    while (expectedTicks > currentTick) {
        tick();
    }

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programVis);
    gl.viewport(0, 0, visWidth, visHeight);
    updateUniforms(programVis);

    // only the vis program gets to see the back buffer or subtick variables
    var unit = 1;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, simBackTex);
    gl.uniform1i(gl.getUniformLocation(programVis, "uCurrent"), unit);

    gl.uniform1f(gl.getUniformLocation(programVis, "uSubTick"), expectedTicks - Math.floor(expectedTicks));

    currentFrame += 1;
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(draw);
}


function init() {
    const canvas = document.getElementById("mainCanvas");
    if (canvas.getContext) {
        gl = canvas.getContext("webgl2");
        if (!gl) {
            return;
        }
        onResize();

        updatePrograms();

        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        requestAnimationFrame(draw);
    }

}

function mouseMoveHandler(evt) {
    if (!gl) {
        return;
    }
    var rect = gl.canvas.getBoundingClientRect();

    mouseX = (evt.clientX - rect.left) * window.devicePixelRatio;
    mouseY = ((rect.height) - (evt.clientY - rect.top)) * window.devicePixelRatio;
}

window.addEventListener("load", init);
document.addEventListener("mousemove", mouseMoveHandler, false);

