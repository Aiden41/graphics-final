const VERTEX_STRIDE = 48;

class Mesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
     * @param {material} material
    */
    constructor( gl, program, vertices, indices, material) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;
    };

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     */

    static empty( gl, program, material) {

        let verts = [];
        
        let indis = [];

        return new Mesh( gl, program, verts, indis, material);
    };

    
    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     */
    static height_map( gl, program,heights, material ) {
        //heightmap
        let rows = heights.length
        let cols = heights[0].length
        let off_x = cols/2;
        let off_y = rows/2;
        const MIN_HEIGHT_COLOR = 0.2;

        let verts = [];
        let indis = [];
        let indi_start = 0;
        
        for(let row = 1; row < rows; row++){
            for(let col = 1; col < cols; col++){
                let pos_tl = heights[row - 1][col - 1];
                let pos_tr = heights[row - 1][col];
                let pos_bl = heights[row][col - 1];
                let pos_br = heights[row][col];

                let v_tl = new Vec4( -1, pos_tl, -1 );
                let v_tr = new Vec4( 0, pos_tr, -1 );
                let v_bl = new Vec4( -1, pos_bl, 0 );
                let v_br = new Vec4( 0, pos_br, 0 );

                let normal_t1 = v_bl.normal_of_triangle( v_tl, v_tr, v_bl );
                let normal_t2 = v_bl.normal_of_triangle( v_br, v_bl, v_tr );

                v_tl.x += col - off_x;
                v_tl.z += row - off_y;

                v_tr.x += col - off_x;
                v_tr.z += row - off_y;

                v_bl.x += col - off_x;
                v_bl.z += row - off_y;

                v_br.x += col - off_x;
                v_br.z += row - off_y;


                verts.push( v_tl.x, v_tl.y, v_tl.z,     1,0,0,1, 0,1, normal_t1.x, normal_t1.y, normal_t1.z );
                verts.push( v_tr.x, v_tr.y, v_tr.z,     1,0,0,1, 1,1, normal_t1.x, normal_t1.y, normal_t1.z );
                verts.push( v_bl.x, v_bl.y, v_bl.z,     1,0,0,1, 0,0, normal_t1.x, normal_t1.y, normal_t1.z );

                verts.push( v_br.x, v_br.y, v_br.z,     1,0,0,1, 1,0, normal_t2.x, normal_t2.y, normal_t2.z );
                verts.push( v_bl.x, v_bl.y, v_bl.z,     1,0,0,1, 0,0, normal_t2.x, normal_t2.y, normal_t2.z );
                verts.push( v_tr.x, v_tr.y, v_tr.z,     1,0,0,1, 1,1, normal_t2.x, normal_t2.y, normal_t2.z );


                indis.push(
                    indi_start,
                    indi_start + 1,
                    indi_start + 2,
                    indi_start + 3,
                    indi_start + 4,
                    indi_start + 5
                    );
                indi_start += 6;
            }
        }

        function hm_color(height){
            let normed_height = (height)
        }

        return new Mesh( gl, program, verts, indis, material);
    
    };

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height
     */
    static wall( gl, program, width, height, material ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let norm = new Vec4(hwidth,hheight,0,0).norm();

        let verts = [
            -hwidth, hheight, 0,       0.0, 0.0, 1.0, 1.0, 1, 0, norm.x, norm.y, 0, // front face
            -hwidth, -hheight, 0,      0.0, 1.0, 0.0, 1.0, 1, 1, norm.x, norm.y, 0,
            hwidth, -hheight, 0,       1.0, 0.0, 0.0, 1.0, 0, 1, norm.x, norm.y, 0,
            hwidth, hheight, 0,        1.0, 1.0, 0.0, 1.0, 0, 0, norm.x, norm.y, 0,
        
            hwidth, hheight, 0,        1.0, 1.0, 0.5, 1.0, 1, 0, norm.x, norm.y, 0,// back face
            hwidth, -hheight, 0,       1.0, 0.0, 1.0, 1.0, 1, 1, norm.x, norm.y, 0,
            -hwidth, -hheight, 0,      0.0, 1.0, 1.0, 1.0, 0, 1, norm.x, norm.y, 0,
            -hwidth, hheight, 0,       0.5, 0.5, 1.0, 1.0, 0, 0, norm.x, norm.y, 0
        ];

        let indis = [
            // clockwise winding
            0, 3, 2, 2, 1, 0,
            4, 7, 6, 6, 5, 4
        ];

        return new Mesh( gl, program, verts, indis, material);
    };

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

        static box( gl, program, width, height, depth, material, winding ) {
            let hwidth = width / 2.0;
            let hheight = height / 2.0;
            let hdepth = depth / 2.0;
            let norm = new Vec4(hwidth,hheight,hdepth,0).norm();
    
            let verts = [
                -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0, 0.25, -norm.x, norm.y, -norm.z, // front face
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0, 0.5, -norm.x, -norm.y, -norm.z,
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z,
    
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z, // right face
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z,
    
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z,// back face
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
                -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, norm.z,
    
                -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0, -norm.x, norm.y, norm.z,// top face
                -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.5, 0.25, norm.x, norm.y, -norm.z,
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0, norm.x, norm.y, norm.z,
    
                -hwidth, hheight, hdepth,       0.0, 0.0, 1.0, 1.0, 1, 0.25, -norm.x, norm.y, norm.z,// left face
                -hwidth, -hheight, hdepth,      0.0, 1.0, 0.0, 1.0, 1, 0.5, -norm.x, -norm.y, norm.z,
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, -norm.z,
                -hwidth, hheight, -hdepth,      0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,
    
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0.75, 0.75, -norm.x, -norm.y, -norm.z,// bottom face
                -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.5, 0.75, norm.x, -norm.y, -norm.z
            ];
            
            let indis = [];

            if(winding == 0){
                indis = [
                    // counter-clockwise winding
                    0, 1, 2, 2, 3, 0,
                    4, 5, 6, 6, 7, 4,
                    8, 9, 10, 10, 11, 8,
                    12, 13, 14, 14, 15, 12,
                    16, 17, 18, 18, 19, 16,
                    20, 21, 22, 22, 23, 20
                ];
            }
            else{
                indis = [
                    // clockwise winding
                    0, 3, 2, 2, 1, 0,
                    4, 7, 6, 6, 5, 4,
                    8, 11, 10, 10, 9, 8,
                    12, 15, 14, 14, 13, 12,
                    16, 19, 18, 18, 17, 16,
                    20, 23, 22, 22, 21, 20
                ];
            };
    
            return new Mesh( gl, program, verts, indis, material);
        };

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static inverse_options_box( gl, program, width, height, depth, material, options ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;
        let norm = new Vec4(hwidth,hheight,hdepth,0).norm();
        let verts = [];

        if(options.length != 6){ throw new console.error("options must be of length 6.");}

        if(options[0]===1){// front face
            verts.push(
                -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0, 0.25, -norm.x, norm.y, -norm.z, 
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0, 0.5, -norm.x, -norm.y, -norm.z,
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z);
        }
        if(options[1]===1){// right face
            verts.push(
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z, 
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z);
        }
        if(options[2]===1){// back face
            verts.push(
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z,
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
                -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, norm.z);
        }
        if(options[3]===1){// top face
            verts.push(
                -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0, -norm.x, norm.y, norm.z,
                -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,
                hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.5, 0.25, norm.x, norm.y, -norm.z,
                hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0, norm.x, norm.y, norm.z);
        }
        if(options[4]===1){// left face
            verts.push(
                -hwidth, hheight, hdepth,       0.0, 0.0, 1.0, 1.0, 1, 0.25, -norm.x, norm.y, norm.z,
                -hwidth, -hheight, hdepth,      0.0, 1.0, 0.0, 1.0, 1, 0.5, -norm.x, -norm.y, norm.z,
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, -norm.z,
                -hwidth, hheight, -hdepth,      0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z);
        }
        if(options[5]===1){// bottom face
            verts.push(
                -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0.75, 0.75, -norm.x, -norm.y, -norm.z,
                -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
                hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
                hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.5, 0.75, norm.x, -norm.y, -norm.z);
        }

        let indis = [
            // clockwise winding
            0, 3, 2, 2, 1, 0,
            4, 7, 6, 6, 5, 4,
            8, 11, 10, 10, 9, 8,
            12, 15, 14, 14, 13, 12,
            16, 19, 18, 18, 17, 16,
            20, 23, 22, 22, 21, 20
        ];

        return new Mesh( gl, program, verts, indis, material);
    }

    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 12
        );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "uv", 
            this.verts, 2, 
            gl.FLOAT, false, VERTEX_STRIDE, 28
        );

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "normals",
            this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 36
        );
        

        gl.bindTexture( gl.TEXTURE_2D, this.material.texture );
        set_uniform_scalar( gl, this.program, 'mat_ambient', this.material.ambient );
        set_uniform_scalar( gl, this.program, 'mat_diffuse', this.material.diffuse );
        set_uniform_scalar( gl, this.program, 'mat_specular', this.material.specular );
        set_uniform_scalar( gl, this.program, 'mat_shininess', this.material.shininess );
        const sampler_loc = gl.getUniformLocation(this.program, 'tex_0');
        gl.uniform1i(sampler_loc, 0);
        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    };

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     */
    static from_obj_text( gl, program, text, material, winding ) {
        let verts = [];
        let indis = [];

        let lines = text.split( /\r?\n/ );
        let color_change = 0;
        for(var index = 0; index < lines.length; index++)
        {
            let line = lines[index].trim();
            let parts_of_line = line.split( /(\s+)/ );

            if(parts_of_line[0] === 'v' && parts_of_line[1] !== 'n')
            {
                verts.push(parts_of_line[2], parts_of_line[4], parts_of_line[6]); // vertices
                verts.push(0.0, 0.0, 0.0, 1, 0, 0.5); // colors
                let norm = new Vec4(parts_of_line[2],parts_of_line[4],parts_of_line[6],0).norm();
                verts.push(norm.x, norm.y, norm.z);
            }

            if(parts_of_line[0] === 'f')
            {
                if(winding == 0){
                    indis.push(parts_of_line[2]-1, parts_of_line[4]-1, parts_of_line[6]-1); // indices
                }
                else{
                    indis.push(parts_of_line[6]-1, parts_of_line[4]-1, parts_of_line[2]-1); // indices
                }
                
            }
        }
        
        return new Mesh( gl, program, verts, indis, material);
    }

    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file( gl, file_name, program, f, material, winding, _callback) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText, material, winding);

            console.log( 'loaded ', file_name );
            f( loaded_mesh );
            _callback();
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}
