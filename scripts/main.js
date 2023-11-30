// formulas for S_x, S_y and values for near and far found from http://learnwebgl.brown37.net/08_projections/projections_perspective.html

let canvas = document.getElementById('the-canvas');
let canvas2 = document.getElementById('the-canvas2');
var glContextAttributes = { preserveDrawingBuffer: true }; 
/** @type {WebGLRenderingContext} */
let gl=canvas.getContext('webgl2', glContextAttributes);

gl.clearColor(0.9,0.9,1.0,1.0);
gl.enable( gl.DEPTH_TEST );
gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

let vertex_source =
    `#version 300 es
    precision mediump float;

    uniform mat4 modelview;
    uniform mat4 persp;
    in vec2 uv;
    in vec3 coordinates;
    in vec4 color;
    in vec3 normals;

    out vec4 v_color;
    out vec2 v_uv;
    out vec3 v_normals;
    out mat4 v_model; 
    out vec3 v_coordinates;

    void main(void){
        gl_Position = persp * modelview * vec4(coordinates,1.0);
        v_color = color;
        v_uv = uv;
        v_normals = normals;
        v_coordinates = coordinates;
        v_model = modelview;
    }`;

let fragment_source = 
    `#version 300 es
    precision mediump float;

    in vec2 v_uv;
    in vec4 v_color;
    in vec3 v_normals;
    in vec3 v_coordinates;
    in mat4 v_model;
    uniform mat4 model;
    uniform sampler2D tex_0;

    uniform float mat_ambient;
    uniform float mat_diffuse;
    uniform float mat_specular;
    uniform float mat_shininess;

    //uniform vec3 sun_dir;
    //uniform vec3 sun_color;

    //uniform vec3 point_pos;
    //uniform vec3 point_color;

    uniform vec3 camera_pos;
    uniform vec4 light_positions[50];
    uniform vec3 light_colors[50];
    uniform int light_count;

    out vec4 f_color;

    vec3 diff_color( vec3 normal, vec3 light_dir, vec3 light_color, float mat_diffuse ){ 
        return mat_diffuse * light_color * max( dot( normal, light_dir ), 0.0 );
    }

    vec3 spec_color( vec3 normal, vec3 camera_dir, vec3 light_dir, vec3 light_color, float mat_specular, float mat_shininess ){
        float ln = dot(normal, light_dir);
        vec3 reflection = (2.0 * ln * normal) - light_dir;
        return (mat_specular * pow( max( dot(reflection, camera_dir), 0.0), mat_shininess)) * light_color;
    }

    void main(void){
        vec3 normal_tx = normalize( mat3( model ) * v_normals );
        vec3 coords_tx = ( model * vec4(v_coordinates, 1.0) ).xyz;
        vec3 camera_dir = normalize(camera_pos - coords_tx); 

        vec4 ambient_color = vec4( mat_ambient, mat_ambient, mat_ambient, 1.0 );

        f_color = ambient_color;

        for(int i=0;i<light_count;i++){
            if(light_positions[i].w == 0.0){
                vec3 sun_tx = normalize( vec3(light_positions[i].x,light_positions[i].y,light_positions[i].z) );
                vec3 sun_color = light_colors[i];
                vec4 sun_diffuse_color = vec4( diff_color( normal_tx, sun_tx, sun_color, mat_diffuse ), 1.0 );
                vec4 sun_specular_color = vec4( spec_color( normal_tx, camera_dir, sun_tx, sun_color, mat_specular, mat_shininess ), 1.0);
                f_color = f_color + sun_diffuse_color + sun_specular_color;
            }
            else{
                vec3 point_dir = vec3(light_positions[i].x,light_positions[i].y,light_positions[i].z) - coords_tx;
                vec3 point_tx = normalize( point_dir );
                float distance = length( point_dir );
                vec3 point_color = light_colors[i];
                vec4 point_diffuse_color = vec4( diff_color( normal_tx, point_tx, point_color, mat_diffuse ), 1.0 );
                vec4 point_specular_color = vec4( spec_color( normal_tx, camera_dir, point_tx, point_color, mat_specular, mat_shininess ), 1.0);
                float attenuation = 1.0/(0.3*distance);
                vec4 color_from_light = (point_diffuse_color + point_specular_color)*attenuation;
                f_color = f_color + color_from_light;
            }
        }

        f_color = f_color * texture( tex_0, v_uv );
    }`;

let vert_shader = gl.createShader(gl.VERTEX_SHADER);
let frag_shader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vert_shader, vertex_source);
gl.shaderSource(frag_shader, fragment_source);

gl.compileShader(vert_shader);
gl.compileShader(frag_shader);
console.log(gl.getShaderInfoLog(frag_shader));

let shader_program = gl.createProgram();

gl.attachShader(shader_program, vert_shader);
gl.attachShader(shader_program, frag_shader);

gl.linkProgram(shader_program);
gl.useProgram(shader_program);

let tau = (Math.PI*2);
let fov = 0.25*tau;
// near and far always positive, near always less than far
let near = 0.1;
let far = 50;
let top1 = Math.tan(fov/2) * near;
let bottom = -top1;
let right = top1 * 16/9;
let left = -right;

let metal_texture = loadTexture('src/textures/metal_scale.png');
let metal_scale = new Material(0.25, 1.0, 2.0, 4.0, metal_texture);
let metal_sphere_mesh = make_uv_sphere(gl, shader_program, 16, metal_scale);

let brick_texture = loadTexture('src/textures/brick_wall.png');
let brick_wall = new Material(0.25, 1.0, 2.0, 4.0, brick_texture);
let brick_sphere_mesh = make_uv_sphere(gl, shader_program, 16, brick_wall);

let xor_tex = makeXORTexture();
let xor_mat = new Material(0.25, 1.0, 2.0, 4.0, xor_tex);
let xor_sphere_mesh = make_uv_sphere(gl, shader_program, 16, xor_mat);

let persp = Mat4.frustum(left, right, bottom, top1, near, far);
set_uniform_matrix4(gl, shader_program, "persp", persp.data);
let view = Mat4.identity();
const movement = 0.03;
let movement_vec = new Vec4(0, 0, -2.5);
const rotation_speed = movement/tau;
let yaw = 0;
let pitch = 0;
let roll = 0;

let scene = new Node();

//spheres
let sphere1 = scene.add_child();
sphere1.data = metal_sphere_mesh;
sphere1.scale = new Vec4(2,2,2);
sphere1.position = new Vec4(0,0,0);

let sphere2 = sphere1.add_child();
sphere2.position = new Vec4(1,0,0);
sphere2.data = brick_sphere_mesh;

let sphere3 = sphere1.add_child();
sphere3.position = new Vec4(-1,0,0);
sphere3.scale = new Vec4(0.5, 0.5, 0.5);
sphere3.data = metal_sphere_mesh;

//lights
let point1 = scene.add_child();
point1.data = new Light([-2.5, -2.0, -0.5], [1.0, 0.0, 0.0], 1);

let point2 = scene.add_child();
point2.data = new Light([5.0, -2.0, 0.0], [0.0, 0.0, 1.0], 1);

//boxes
// let box1 = scene.add_child();
// box1.data = Mesh.inverse_options_box(gl, shader_program, 10, 7, 10, brick_wall, [1,1,0,1,0,1]);
// box1.position = new Vec4(5,0,0);

// let box2 = scene.add_child();
// box2.data = Mesh.inverse_options_box(gl, shader_program, 10, 7, 10, brick_wall, [1,0,0,1,1,1]);
// box2.position = new Vec4(-5,0,0);

//walls
let wall1 = scene.add_child();
wall1.data = Mesh.wall(gl,shader_program,10,7,brick_wall);
wall1.position = new Vec4(-5,0,1);

let wall2 = scene.add_child();
wall2.data = Mesh.wall(gl,shader_program,10,7,brick_wall);
wall2.position = new Vec4(5,0,1);

gl.viewport( 0, 0, 1280, 720 );

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let jobs = [];
    let lights = [];
    generate_render_jobs(new Mat4, scene, jobs, lights);
    let light_positions = [];
    let light_colors = [];
    for(let light of lights){
        light_positions.push(light.location[0],light.location[1],light.location[2],light.type);
        light_colors.push(light.color[0], light.color[1], light.color[2]);
    };
    for(let job of jobs){
        let model = job.matrix;
        gl.useProgram(job.mesh.program);
        set_uniform_matrix4(gl, job.mesh.program, "model", model.data);
        let modelview = view.inverse().mul(model);
        set_uniform_matrix4(gl, job.mesh.program, "modelview", modelview.data);
        set_uniform_vec4_array(gl, job.mesh.program, "light_positions", light_positions);
        set_uniform_vec3_array(gl, job.mesh.program, "light_colors", light_colors);
        set_uniform_int(gl, job.mesh.program, "light_count", lights.length);
        job.mesh.render(gl);
    }
    requestAnimationFrame(render);
};

function generate_render_jobs(parent_matrix, node, jobs, lights){
    if( node.data instanceof Light ) {
        lights.push( new RenderLight( node.data.location, node.data.color, node.data.type ) );
        for(let child of node.children){
            generate_render_jobs(matrix, child, jobs, lights);
        };
    }
    else{
        let matrix = parent_matrix.mul(node.get_matrix());
        if(node.data != null){
            jobs.push(new RenderMesh(matrix, node.data));
        };
        
        for(let child of node.children){
            generate_render_jobs(matrix, child, jobs, lights);
        };
    };
};

function makeXORTexture(){
    let tex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        256, 256, 0,
        gl.RGBA, gl.UNSIGNED_BYTE,
        xor_texture()
    );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    return tex;
};

function loadTexture(src){
    let tex = gl.createTexture();
    tex.image = new Image();
    tex.image.onload = function(){
        gl.bindTexture( gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image );
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    };
    tex.image.src = src;
    return tex;
};

function on_load(){
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[num].image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
};

function xor_texture() {
    let data = new Array( 256 * 256 * 4 );
    // 4 because there are 4 bytes per pixel: R, G, B, and A
    // generate pixels here
    for( let row = 0; row < 256; row++ ) {
        for( let col = 0; col < 256; col++ ) {
            let pix = ( row * 256 + col ) * 4; 
            data[pix] = data[pix + 1] = data[pix + 2] = row ^ col;
            data[pix + 3] = 255;
        }
    }
    return new Uint8Array( data );
};

function make_uv_sphere( gl, program, subdivs, material) {
    let verts = [];
    let indis = [];

    for(let layer = 0; layer <= subdivs; layer++ ){
        let y_turns = layer / subdivs / 2;
        let y = Math.cos( y_turns * tau ) / 2;
        let radius_scale = Math.sin( 2 * Math.PI * y_turns );
        for( let subdiv = 0; subdiv <= subdivs; subdiv++ ) {
            let turns = subdiv / subdivs;
            let rads = turns * tau;
            let x = Math.cos( rads ) / 2 * radius_scale;
            let z = Math.sin( rads ) / 2 * radius_scale;
            let u = subdiv / subdivs;
            let v = layer / subdivs;
            let norm = new Vec4(x,y,z,0).norm();

            verts.push( x, y, z, 1, 1, 1, 1, u, v, norm.x, norm.y, norm.z);
            let index = layer * (subdivs + 1) + subdiv;
            let index2 = index + (subdivs + 1);
            let index3 = index + 1;
            let index4 = index2 + 1;
            indis.push(index2, index4, index3, index3, index, index2);
        }
    }

    return new Mesh(gl, program, verts, indis, material);
};

function update() {
    sphere1.position
    let basis_x = view.basis_x();
    let basis_y = view.basis_y();
    let basis_z = view.basis_z();
    if(keys.is_key_down('ArrowUp'))
    {
        pitch -= rotation_speed;
    }
    if(keys.is_key_down('ArrowDown'))
    {
        pitch += rotation_speed;
    }
    if(keys.is_key_down('ArrowLeft'))
    {
        yaw -= rotation_speed;
    }
    if(keys.is_key_down('ArrowRight'))
    {
        yaw += rotation_speed;
    }
    if(keys.is_key_down('KeyW'))
    {
        movement_vec = movement_vec.add(basis_z.scaled(movement));
    }
    if(keys.is_key_down('KeyA'))
    {
        movement_vec = movement_vec.add(basis_x.scaled(-movement));
    }
    if(keys.is_key_down('KeyS'))
    {
        movement_vec = movement_vec.add(basis_z.scaled(-movement));
    }
    if(keys.is_key_down('KeyD'))
    {
        movement_vec = movement_vec.add(basis_x.scaled(movement));
    }
    if(keys.is_key_down('KeyC'))
    {
        movement_vec = movement_vec.add(basis_y.scaled(-movement));
    }
    if(keys.is_key_down('Space'))
    {
        movement_vec = movement_vec.add(basis_y.scaled(movement));
    }
    if(keys.is_key_down('KeyQ'))
    {
        roll -= rotation_speed;
    }
    if(keys.is_key_down('KeyE'))
    {
        roll += rotation_speed;
    }
    view = Mat4.translation(movement_vec.x, movement_vec.y, movement_vec.z).mul(Mat4.rotation_xz(yaw).mul(Mat4.rotation_yz(pitch).mul(Mat4.rotation_xy(roll))));
    set_uniform_vec3_array(gl, shader_program, 'camera_pos', [movement_vec.x, movement_vec.y, movement_vec.z]);
};

async function take_and_send_screenshot(){
    var img = canvas2.toDataURL();
    const request = new Request("http://localhost:8000", {
        method: "POST",
        body: img,
    });
    const response = await fetch(request);
    const prediction = response['statusText'];
    console.log(prediction);
    openCanvasHidden();
    return prediction;
};

const ctx = canvas2.getContext('2d');
const drawing = document.getElementById('innerContainer');

window.addEventListener('load', ()=>{ 
    ctx.rect(0, 0, 1280, 720);
    ctx.fillStyle = "white";
    ctx.fill();
    document.addEventListener('mousedown', startDrawing); 
    document.addEventListener('mouseup', stopDrawing); 
    document.addEventListener('mousemove', currentlyDrawing); 
    document.addEventListener("keydown", openCanvas);
}); 

function openCanvas(event)
{
    if(event.keyCode === 27)
    {
        myClear();
        if(drawing.style.visibility == "visible"){
            drawing.style.visibility = "hidden";
        }
        else{
            drawing.style.visibility = "visible";
        }
    }
};

function openCanvasHidden()
{
    myClear();
    if(drawing.style.visibility == "visible"){
        drawing.style.visibility = "hidden";
    }
    else{
        drawing.style.visibility = "visible";
    }
};

function myClear(){
    ctx.fillStyle = "clear"
    ctx.rect(0, 0, 1280, 720);
    ctx.fillStyle = "white";
    ctx.fill();
};
    
let coord = {x:0 , y:0};  
   
let draw = false; 

function startDrawing(event){ 
    draw = true; 
    coord.x = event.clientX;
    coord.y = event.clientY;
};

function stopDrawing(){ 
    draw = false; 
};
    
function currentlyDrawing(event){ 
    if(draw == false){
        return; 
    }
    ctx.beginPath(); 
    ctx.lineWidth = 50; 
    ctx.lineCap = 'round'; 
    ctx.strokeStyle = 'black';    
    ctx.moveTo(coord.x, coord.y);  
    coord.x = event.clientX;
    coord.y = event.clientY; 
    ctx.lineTo(coord.x , coord.y); 
    ctx.stroke(); 
};

class Keys {
    constructor() {
        this.keys_down = {}
    }

    is_key_down( code ) {
        return !!this.keys_down[ code ];
    }
        
    is_key_up( code ) {
        return !this.keys_down[ code ];
    }
    
    keys_down_list() {
        return Object.entries(this.keys_down)
        .filter( kv => kv[1] /* the value */ )
        .map( kv => kv[0] /* the key */ )
    }

    static start_listening() {
        let keys = new Keys();
        addEventListener( 'keydown', function( ev ) {
            if( typeof ev.code === 'string' ){
                keys.keys_down[ ev.code ] = true;
            }
        })
        addEventListener( 'keyup', function( ev ) {
            if( typeof ev.code === 'string' ){
                keys.keys_down[ ev.code ] = false;
            }
        })
        return keys;
    }
}

let keys = Keys.start_listening();
setInterval( update, 1000/60 );
requestAnimationFrame(render);