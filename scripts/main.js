// formulas for S_x, S_y and values for near and far found from http://learnwebgl.brown37.net/08_projections/projections_perspective.html

let canvas = document.getElementById('the-canvas');
let canvas2 = document.getElementById('the-canvas2');
var glContextAttributes = { preserveDrawingBuffer: true }; 
/** @type {WebGLRenderingContext} */
let gl=canvas.getContext('webgl2', glContextAttributes);

gl.clearColor(0,0,0,1.0);
gl.enable( gl.DEPTH_TEST );
gl.enable( gl.CULL_FACE );
gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

const ctx = canvas2.getContext('2d');
const drawing = document.getElementById('innerContainer');
let coord = {x:0 , y:0};  
let draw = false; 

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

        gl_Position = persp * modelview * (vec4(coordinates,1.0));
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
                float attenuation = 1.0/(0.6*distance);
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

//------------- new textures --------------------

let cream_wall_texture = loadTexture('src/textures/Stock_Cream_Wall.jpg');
let cream_wall = new Material(0.55, 0.5, 1.0, 2.0, cream_wall_texture);

let concrete_floor_texture = loadTexture('src/textures/Concrete_Floor.jpg');
let concrete_floor = new Material(0.25, 1.0, 2.0, 4.0, concrete_floor_texture);

let java_base_texture = loadTexture('src/textures/Java_Logo_Base.png');
let java_base_mat = new Material(0.55, 1.0, 2.0, 4.0, java_base_texture);

let java_top_texture = loadTexture('src/textures/Java_Logo_Top.png');
let java_top_mat = new Material(0.55, 1.0, 2.0, 4.0, java_top_texture);

let grantDoor_off_tex = loadTexture('src/textures/grantDoor_off.jpg');
let grantDoor_off = new Material(0.55, 1.0, 2.0, 4.0, grantDoor_off_tex);

let grantDoor_on_tex = loadTexture('src/textures/grantDoor_on.jpg');
let grantDoor_on = new Material(0.55, 1.0, 2.0, 4.0, grantDoor_on_tex);

let green_tex = loadTexture('src/textures/green.jpg');
let green = new Material(0.55, 1.0, 2.0, 4.0, green_tex);

let question_1_tex = loadTexture('src/textures/firstquestion.png');
let question_1 = new Material(0.55, 1.0, 2.0, 4.0, question_1_tex);

let question_2_tex = loadTexture('src/textures/secondquestion.png');
let question_2 = new Material(0.55, 1.0, 2.0, 4.0, question_2_tex);

let question_3_tex = loadTexture('src/textures/thirdquestion.png');
let question_3 = new Material(0.55, 1.0, 2.0, 4.0, question_3_tex);

let question_4_tex = loadTexture('src/textures/fourthquestion.png');
let question_4 = new Material(0.55, 1.0, 2.0, 4.0, question_4_tex);

let sun_tex = loadTexture('src/textures/sun.jpg');
let sun_mat = new Material(0.75, 1.0, 2.0, 2.0, sun_tex);

let planet1_tex = loadTexture('src/textures/planet1.jpg');
let planet1_mat = new Material(0.55, 1.0, 2.0, 4.0, planet1_tex);

let planet2_tex = loadTexture('src/textures/planet2.jpg');
let planet2_mat = new Material(0.65, 1.0, 2.0, 4.0, planet2_tex);

let planet3_tex = loadTexture('src/textures/planet3.jpg');
let planet3_mat = new Material(0.75, 1.0, 2.0, 4.0, planet3_tex);

let moon_tex = loadTexture('src/textures/moon.jpg');
let moon_mat = new Material(0.55, 1.0, 2.0, 4.0, moon_tex);

let door_tex = loadTexture('src/textures/door.jpg');
let door_mat = new Material(0.55, 1.0, 2.0, 4.0, door_tex);

//------------- end of new textures -------------------------------

let metal_texture = loadTexture('src/textures/metal_scale.png');
let metal_scale = new Material(0.55, 1.0, 2.0, 4.0, metal_texture);
let metal_sphere_mesh = make_uv_sphere(gl, shader_program, 16, metal_scale);

let brick_texture = loadTexture('src/textures/brick_wall.png');
let brick_wall = new Material(0.55, 1.0, 2.0, 4.0, brick_texture);
let brick_sphere_mesh = make_uv_sphere(gl, shader_program, 16, brick_wall);

let xor_tex = makeXORTexture();
let xor_mat = new Material(0.25, 1.0, 2.0, 4.0, xor_tex);
let xor_sphere_mesh = make_uv_sphere(gl, shader_program, 16, xor_mat);

let persp = Mat4.frustum(left, right, bottom, top1, near, far);
set_uniform_matrix4(gl, shader_program, "persp", persp.data);
let view = Mat4.identity();
let movement = 0.12;
let movement_vec = new Vec4(0, 0, -2.5);
const rotation_speed = movement/tau;
let yaw = 0;
let pitch = 0;
let roll = 0;

let gamestate = 0;
let heightmap_datamap = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

let scene = new Node();

let heightmap1 = scene.add_child();
heightmap1.data = Mesh.height_map(gl,shader_program,heightmap_datamap,brick_wall);
heightmap1.position = new Vec4(-20,-3,0);


let sunSpin = 0;
let sun = scene.add_child();
sun.data = make_uv_sphere(gl,shader_program,15,sun_mat);
sun.scale = new Vec4(6,6,6);
sun.position = new Vec4(-10,-5,25);

let sun_light = sun.add_child();
sun_light.data = new Light([-10,-5,25],[5,0,0],1);

let sun_reverse = scene.add_child();
sun_reverse.data = make_uv_sphere(gl,shader_program,15,sun_mat);
sun_reverse.scale = new Vec4(1.8,1.8,1.8);
sun_reverse.position = new Vec4(-10,-5,25);


let planet1 = sun.add_child();
planet1.data = make_uv_sphere(gl,shader_program,15,planet1_mat);
planet1.scale = new Vec4(0.35,0.35,0.35);
planet1.position = new Vec4(0,0,-3);

let planet1_light = planet1.add_child();
planet1_light.data = new Light([0,0,0],[1,1,3],1);

let moon1 = planet1.add_child();
moon1.data = make_uv_sphere(gl,shader_program,15,moon_mat);
moon1.scale = new Vec4(0.25,0.25,0.25);
moon1.position = new Vec4(0,0,-1);


let planet2 = sun_reverse.add_child();
planet2.data = make_uv_sphere(gl,shader_program,15,planet2_mat);
planet2.scale = new Vec4(0.3,0.3,0.3);
planet2.position = new Vec4(0,0,-8);

let planet2_light = planet2.add_child();
planet2_light.data = new Light([0,0,0],[0,0,2],1);

let sun_slow = scene.add_child();
sun_slow.data = make_uv_sphere(gl,shader_program,15,brick_wall);
sun_slow.position = new Vec4(-10,-5,25);

let planet3 = sun_slow.add_child();
planet3.data = make_uv_sphere(gl,shader_program,15,planet3_mat);
planet3.scale = new Vec4(0.8,0.8,0.8);
planet3.position = new Vec4(0,0,4);

let planet3_light = planet3.add_child();
planet3_light.data = new Light([0,0,0],[2,0,0],1);

//walls
//WARNING this leaves the variables as local, meaning all wall names outside of this function are "undefined"
function addWall(name, w_width, w_height, w_material, positionOfWall,wroll=0,wpitch=0,wyaw=0){
    name = scene.add_child();
    name.data = Mesh.wall(gl,shader_program,w_width,w_height,w_material);
    name.position = new Vec4(positionOfWall[0],positionOfWall[1],positionOfWall[2]);
    name.roll = wroll;
    name.pitch = wpitch;
    name.yaw = wyaw;
}
let wall1, wall2, wall3, wall4, wall5, wall6, wall7, wall8, wall9, wall10, wall11, wall12, wall13, wall14, wall15, wall16, wall17;
let fence_post1,fence_post2,fence_post3,fence_post4,fence_post5,fence_post6,fence_post7, fence_rail;
let inner1_wall,inner1_door,inner2_wall,inner2_door,inner3_wall,inner3_door;
//front
addWall(wall1,10,7,cream_wall,[-30,0,5]);
addWall(wall12,10,7,cream_wall,[-20,0,5]);
addWall(wall2,10,7,cream_wall,[0,0,5], 0, 0, 0.5);
//back
addWall(wall3,10,7,cream_wall,[-30,0,-5]);
addWall(wall14,6,1,question_4,[-30,1,-4.99]);
addWall(wall4,10,7,cream_wall,[-10,0,-5]);
addWall(wall15,8,0.8,question_2,[-10,1,-4.99]);
addWall(wall13,10,7,cream_wall,[0,0,-5]);
addWall(wall11,8,1,question_1,[0,1,-4.99]);
addWall(wall12,10,7,cream_wall,[-20,0,-5]);
addWall(wall16,8,1,question_3,[-20,1,-4.99]);
//left
wall5 = scene.add_child();
wall5.data = Mesh.wall(gl,shader_program,10,7,grantDoor_off);
wall5.position = new Vec4(-35,0,0);
wall5.yaw = 0.25;

wall17 = scene.add_child();
wall17.data = Mesh.wall(gl,shader_program,10,7,grantDoor_on);
wall17.position = new Vec4(-35,0,0);
wall17.scale = new Vec4(0,0,0);
wall17.yaw = 0.25;
//right
addWall(wall6,10,7,cream_wall,[5,0,0],0,0,0.25);
//bottom
addWall(wall7,20,10,concrete_floor,[-25,-3.5,0],0,0.25);
addWall(wall8,20,10,concrete_floor,[-5,-3.5,0],0,0.25);
//top
addWall(wall9,20,10,cream_wall,[-25,3.5,0],0,0.25);
addWall(wall10,20,10,cream_wall,[-5,3.5,0],0,0.25);


//2nd room fence
addWall(fence_post1,10/13,1.5,brick_wall,[-70/13,-2.75,5]);
addWall(fence_post2,10/13,1.5,brick_wall,[-90/13,-2.75,5]);
addWall(fence_post3,10/13,1.5,brick_wall,[-110/13,-2.75,5]);
addWall(fence_post4,10/13,1.5,brick_wall,[-130/13,-2.75,5]);
addWall(fence_post5,10/13,1.5,brick_wall,[-150/13,-2.75,5]);
addWall(fence_post6,10/13,1.5,brick_wall,[-170/13,-2.75,5]);
addWall(fence_post7,10/13,1.5,brick_wall,[-190/13,-2.75,5]);
addWall(fence_rail,10,0.5,brick_wall,[-10,-1.75,5]);


//doors
addWall(inner1_wall,5,7,cream_wall,[-5,0,2.5],0,0,0.25);
addWall(inner1_wall,2,7,cream_wall,[-5,0,-4],0,0,0.25);
addWall(inner1_wall,3,2,cream_wall,[-5,2.5,-1.5],0,0,0.25);
inner1_door = scene.add_child();
inner1_door.data = Mesh.wall(gl,shader_program,3,5,door_mat);
inner1_door.position = new Vec4(-5,-1,-1.5);
inner1_door.yaw = 0.25;

addWall(inner2_wall,5,7,cream_wall,[-15,0,2.5],0,0,0.25);
addWall(inner2_wall,2,7,cream_wall,[-15,0,-4],0,0,0.25);
addWall(inner2_wall,3,2,cream_wall,[-15,2.5,-1.5],0,0,0.25);
inner2_door = scene.add_child();
inner2_door.data = Mesh.wall(gl,shader_program,3,5,door_mat);
inner2_door.position = new Vec4(-15,-1,-1.5);
inner2_door.yaw = 0.25;

addWall(inner3_wall,5,7,cream_wall,[-25,0,2.5],0,0,0.25);
addWall(inner3_wall,2,7,cream_wall,[-25,0,-4],0,0,0.25);
addWall(inner3_wall,3,2,cream_wall,[-25,2.5,-1.5],0,0,0.25);
inner3_door = scene.add_child();
inner3_door.data = Mesh.wall(gl,shader_program,3,5,door_mat);
inner3_door.position = new Vec4(-25,-1,-1.5);
inner3_door.yaw = 0.25;

let loading_mesh = null;
let java = scene.add_child();
java.pitch = 0.25;
java.position = new Vec4(-30,0,2);
java.scale = new Vec4(1,1,1);
loadTheMesh('/src/models/java.obj', 1, java_top_mat, function(){
    java.data = loading_mesh;
});

let javamid = java.add_child();

javamid.position = new Vec4(0,0,0);
//javamid.scale = new Vec4(1.1,1.1,1.1);
loadTheMesh('/src/models/javamid.obj', 1, java_top_mat, function(){
    javamid.data = loading_mesh;
});

let java_light = java.add_child();
java_light.data = new Light([0,0.5,0],[0.3,0,0],0);

let check1 = scene.add_child();
check1.position = new Vec4(-30,0,4);
check1.scale = new Vec4(0,0,0);
loadTheMesh('/src/models/checkmark.obj', 1, green, function(){
    check1.data = loading_mesh;
});

let check2 = scene.add_child();
check2.position = new Vec4(0,-0.5,2);
check2.scale = new Vec4(0,0,0);
loadTheMesh('/src/models/checkmark.obj', 1, green, function(){
    check2.data = loading_mesh;
});

let check3 = check2.add_child();
check3.position = new Vec4(-3.5,0,0);
check3.scale = new Vec4(0.2,0.2,0.2);
loadTheMesh('/src/models/checkmark.obj', 1, green, function(){
    check3.data = loading_mesh;
});

let check4 = check2.add_child();
check4.position = new Vec4(3.5,0,0);
check4.scale = new Vec4(0.2,0.2,0.2);
loadTheMesh('/src/models/checkmark.obj', 1, green, function(){
    check4.data = loading_mesh;
});

let light_spheres = scene.add_child();
light_spheres.data = Mesh.box(gl,shader_program,0,0,0,brick_wall,0);
light_spheres.scale = new Vec4(-30,0,0);

let light_sphere1 = light_spheres.add_child();
light_sphere1.data = make_uv_sphere(gl,shader_program,15,green);
light_sphere1.position = new Vec4(-34.5,3,4.5);

let light_spin1 = light_sphere1.add_child();
light_spin1.data = Mesh.box(gl,shader_program,0,0,0,brick_wall,0);
light_spin1.position = new Vec4(0,0,2);

let light_sphere2 = light_spheres.add_child();
light_sphere2.data = make_uv_sphere(gl,shader_program,15,green);
light_sphere2.position = new Vec4(-25.5,3,4.5);

let light_spin2 = light_sphere2.add_child();
light_spin2.data = Mesh.box(gl,shader_program,0,0,0,brick_wall,0);
light_spin2.position = new Vec4(0,0,2);


let light_box2 = scene.add_child();
light_box2.data = Mesh.box(gl,shader_program,0,0,0,brick_wall,0);
light_box2.position = new Vec4(-30,0,2);

let light_spin3 = light_box2.add_child();
light_spin3.data = Mesh.box(gl,shader_program,0,0,0,brick_wall,0);
light_spin3.position = new Vec4(0,0,2);

let pointL3 = light_spin3.add_child();
pointL3.data = new Light([0,0,0],[1,0,0],1);


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
        let parent_position = parent_matrix.basis_w();
        let position = parent_position.add(new Vec4(node.data.location[0], node.data.location[1], node.data.location[2]));
        let light_position = [position.x, position.y, position.z];
        lights.push( new RenderLight( light_position, node.data.color, node.data.type ) );
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

function loadTheMesh(src, winding, material, _callback){
    Mesh.from_obj_file(gl, src, shader_program, loadMesh, material, winding, _callback);
}

function loadMesh( load ){
    loading_mesh = load;
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

let check_flag = false;

function update() {
    let basis_x = view.basis_x();
    let basis_y = 0;//view.basis_y();
    let basis_z = view.basis_z();
    if(keys.is_key_down('ArrowUp'))
    {
        pitch += rotation_speed;
    }
    if(keys.is_key_down('ArrowDown'))
    {
        pitch -= rotation_speed;
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
    if(keys.is_key_down('KeyQ'))
    {
        roll -= rotation_speed;
    }
    if(keys.is_key_down('KeyE'))
    {
        roll += rotation_speed;
    }
    if(keys.is_key_up('ShiftLeft'))
    {
        movement = 0.12;
    }
    if(keys.is_key_down('ShiftLeft'))
    {
        movement = 0.24;
    }

    sunSpin += 0.01*Math.PI;
    sun.yaw += 0.005;
    sun.pitch = -Math.sin(sunSpin)/18;
    
    sun_reverse.yaw -= 0.005;
    sun_reverse.pitch = Math.sin(sunSpin)/18;

    sun_slow.yaw += 0.0025;
    sun_slow.pitch = -Math.sin(sunSpin/2)/18;
    planet1.yaw += 0.015;
    
    if(check_flag == false)
    {
        check2.position = check2.position.add(new Vec4(0, 0.003, 0));
        if(check2.position.y >= 0.15)
        {
            check_flag = true;
        }
    }
    if(check_flag == true)
    {
        check2.position = check2.position.add(new Vec4(0, -0.003, 0));
        if(check2.position.y <= 0)
        {
            check_flag = false;
        }
    }
    
    check2.yaw += 0.005;
    check3.yaw += 0.005;
    check4.yaw += 0.005;
    java.yaw += 0.005;
    light_box2.yaw -= 0.005;
    light_sphere1.yaw += 0.005;
    light_sphere2.yaw += 0.005;

    view = Mat4.translation(movement_vec.x, 0, movement_vec.z).mul(Mat4.rotation_xz(yaw).mul(Mat4.rotation_yz(pitch).mul(Mat4.rotation_xy(roll))));
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

    //heightmap1.data = Mesh.height_map(gl,shader_program,[[0,0,0,0],[0,0,0,1],[1,0,0,1],[0,0,0,0]],brick_wall);
    if(prediction === "L" && gamestate === 0){
        scene.del_child(inner1_door);
        check2.scale = new Vec4(0.5,0.5,0.5);
        let check_light1 = check3.add_child();
        check_light1.data = new Light([0,0,0],[0,0.17,0],0);

        let check_light2 = check4.add_child();
        check_light2.data = new Light([0,0,0],[0,0.17,0],0);
        gamestate++;
    }
    else if((prediction === "3" || prediction === "J") && gamestate === 1){
        scene.del_child(inner2_door);
        gamestate++;
    }
    else if(gamestate === 2){
        if(prediction === "0" || prediction === "O"){
            heightmap_datamap[1][1] = 0;
            heightmap_datamap[1][2] = 0;
            heightmap_datamap[2][1] = 0;
            heightmap_datamap[2][2] = 0;
        }
        if(prediction === "1" || prediction === "I" || prediction === "L"){
            heightmap_datamap[1][1] ^= 1;
            heightmap_datamap[1][2] ^= 1;
            heightmap_datamap[2][1] ^= 1;
        }
        if(prediction === "2" || prediction === "Z"){
            heightmap_datamap[1][1] ^= 1;
            heightmap_datamap[2][1] ^= 1;
        }
        if(prediction === "3" || prediction === "J"){
            heightmap_datamap[1][1] ^= 1;
            heightmap_datamap[2][2] ^= 1;
        }
        if(prediction === "4" || prediction === "H"){
            heightmap_datamap[1][1] ^= 1;
            heightmap_datamap[1][2] ^= 1;
        }

        heightmap1.data = Mesh.height_map(gl,shader_program,heightmap_datamap,brick_wall);

        if( heightmap_datamap[1][1] === 1 && heightmap_datamap[1][2] === 1 && heightmap_datamap[2][1] === 1 && heightmap_datamap[2][2] === 1){
            scene.del_child(inner3_door);
            gamestate++;
        }
    }
    else if(gamestate === 3){
        if(prediction === "N"){
            light_spin3.del_child(pointL3);
            scene.del_child(java);
            scene.del_child(wall5);
            wall17.scale = new Vec4(1,1,1);
            
            check1.scale = new Vec4(0.5,0.5,0.5);

            light_spheres.scale = new Vec4(1,1,1);
            let pointL4 = light_spin1.add_child();
            pointL4.data = new Light([0,0,0],[0,2,0],1);
            let pointL5 = light_spin2.add_child();
            pointL5.data = new Light([0,0,0],[0,2,0],1);
        }
    }
    
    console.log(prediction);
    openCanvasHidden();
    return prediction;
};

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