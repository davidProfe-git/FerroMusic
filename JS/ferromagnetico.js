
(function () {
    const canvas = document.getElementById('shader-canvas-ANIMATION_19');

    // Sync the WebGL drawing-buffer size with the CSS-driven layout size.
    // This fires on initial layout and whenever the element is resized.
    function syncSize() {
        const w = canvas.clientWidth || 1280;
        const h = canvas.clientHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
    }
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;

varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Simulación de ruido para el movimiento orgánico del ferrofluido
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    float m1 = 1.79284291400159 - 0.85373472095314 * (a0[0]*a0[0] + h[0]*h[0]);
    float m2 = 1.79284291400159 - 0.85373472095314 * (a0[1]*a0[1] + h[1]*h[1]);
    float m3 = 1.79284291400159 - 0.85373472095314 * (a0[2]*a0[2] + h[2]*h[2]);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 mouse = (u_mouse.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Música simulada (pulsos rítmicos para el efecto visual)
    float bass = sin(u_time * 4.0) * 0.5 + 0.5;
    float treble = sin(u_time * 12.0) * 0.2 + 0.2;
    
    // Deformación del campo magnético basada en el ratón y la música
    float dist = length(uv - mouse * 0.4);
    float magneticForce = smoothstep(1.5, 0.0, dist) * (0.6 + bass * 0.4);
    
    // Ruido para picos de ferrofluido (spikes)
    float n = snoise(uv * 2.5 + u_time * 0.15);
    n += snoise(uv * 5.0 - u_time * 0.4) * 0.5;
    n *= (0.7 + bass * 0.5); // Reactividad al bajo
    
    // Forma circular central (el núcleo del fluido)
    float radius = 0.55 + n * 0.2 + magneticForce * 0.15;
    float circle = smoothstep(radius + 0.02, radius - 0.02, length(uv));
    
    // Efecto de brillo metálico (especular)
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    vec3 normal = normalize(vec3(uv, 1.0 - length(uv)));
    float spec = pow(max(dot(normal, lightDir), 0.0), 48.0);
    
    // Colores industriales: Negro profundo, cian eléctrico para el campo
    vec3 fluidColor = vec3(0.01, 0.01, 0.02); // Negro casi total viscoso
    vec3 fieldColor = vec3(0.0, 0.9, 1.0);    // Cian eléctrico vibrante
    
    // Combinación final
    vec3 color = mix(vec3(0.0), fluidColor, circle);
    
    // Añadir brillo en los bordes y picos
    color += fieldColor * (n * 0.15 + magneticForce * 0.25) * (1.0 - circle) * 0.6;
    color += spec * circle * 0.8; // Reflejo metálico intenso en el fluido
    
    // Aura de campo magnético pulsante
    float aura = smoothstep(radius + 0.5, radius, length(uv));
    color += fieldColor * aura * (0.15 + treble * 0.2);
    
    gl_FragColor = vec4(color, (circle * 0.98 + aura * 0.3));
}`;
    function cs(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // u_mouse is in pixel coordinates matching u_resolution (ShaderToy convention).
    // Shaders that need normalized coords should use: u_mouse / u_resolution.
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
            const nx = (event.clientX - rect.left) / rect.width;
            const ny = 1.0 - (event.clientY - rect.top) / rect.height;
            mouse.x = nx * canvas.width;
            mouse.y = ny * canvas.height;
        }
    });

    function render(t) {
        if (typeof ResizeObserver === 'undefined') syncSize();
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render(0);
})();
