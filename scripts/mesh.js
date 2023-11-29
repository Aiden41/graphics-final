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
    constructor( gl, program, vertices, indices, material ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;
    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static inverse_box( gl, program, width, height, depth, material ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;
        let norm = new Vec4(-hwidth,hheight,-hdepth,0).norm();

        let verts = [
            -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0, 0.25, -norm.x, norm.y, -norm.z, // front face
            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0, 0.5, -norm.x, -norm.y, -norm.z,
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z,

            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.25, 0.25, norm.x, norm.y, -norm.z, // right face
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.25, 0.5, norm.x, -norm.y, -norm.z,
            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z,

            // hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0.25, norm.x, norm.y, norm.z,// back face
            // hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
            // -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
            // -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, norm.z,

            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0, -norm.x, norm.y, norm.z,// top face
            -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,
            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0.5, 0.25, norm.x, norm.y, -norm.z,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0.5, 0, norm.x, norm.y, norm.z,

            -hwidth, hheight, hdepth,      0.0, 0.0, 1.0, 1.0, 1, 0.25, -norm.x, norm.y, norm.z,// left face
            -hwidth, -hheight, hdepth,     0.0, 1.0, 0.0, 1.0, 1, 0.5, -norm.x, -norm.y, norm.z,
            -hwidth, -hheight, -hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, -norm.z,
            -hwidth, hheight, -hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,

            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0.75, 0.75, -norm.x, -norm.y, -norm.z,// bottom face
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.5, 0.75, norm.x, -norm.y, -norm.z
            
        ];

        let indis = [
            // clockwise winding
            0, 3, 2, 2, 1, 0,
            4, 7, 6, 6, 5, 4,
            8, 11, 10, 10, 9, 8,
            12, 15, 14, 14, 13, 12,
            16, 19, 18, 18, 17, 16,
            20, 23, 22, 22, 21, 20

            // counter-clockwise winding
            // 0, 1, 2, 2, 3, 0,
            // 4, 5, 6, 6, 7, 4,
            // 8, 9, 10, 10, 11, 8,
            // 12, 13, 14, 14, 15, 12,
            // 16, 17, 18, 18, 19, 16,
            // 20, 21, 22, 22, 23, 20
        ];

        return new Mesh( gl, program, verts, indis, material);
    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static box( gl, program, width, height, depth, material ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;
        let norm = new Vec4(-hwidth,hheight,-hdepth,0).norm();

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

            -hwidth, hheight, hdepth,      0.0, 0.0, 1.0, 1.0, 1, 0.25, -norm.x, norm.y, norm.z,// left face
            -hwidth, -hheight, hdepth,     0.0, 1.0, 0.0, 1.0, 1, 0.5, -norm.x, -norm.y, norm.z,
            -hwidth, -hheight, -hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, -norm.z,
            -hwidth, hheight, -hdepth,       0.5, 0.5, 1.0, 1.0, 0.75, 0.25, -norm.x, norm.y, -norm.z,

            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0.75, 0.75, -norm.x, -norm.y, -norm.z,// bottom face
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0.75, 0.5, -norm.x, -norm.y, norm.z,
            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0.5, 0.5, norm.x, -norm.y, norm.z,
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0, 0.5, 0.75, norm.x, -norm.y, -norm.z
            
        ];

        let indis = [
            // clockwise winding
            // 0, 3, 2, 2, 1, 0,
            // 4, 7, 6, 6, 5, 4,
            // 8, 11, 10, 10, 9, 8,
            // 12, 15, 14, 14, 13, 12,
            // 16, 19, 18, 18, 17, 16,
            // 20, 23, 22, 22, 21, 20

            // counter-clockwise winding
            0, 1, 2, 2, 3, 0,
            4, 5, 6, 6, 7, 4,
            8, 9, 10, 10, 11, 8,
            12, 13, 14, 14, 15, 12,
            16, 17, 18, 18, 19, 16,
            20, 21, 22, 22, 23, 20
        ];

        return new Mesh( gl, program, verts, indis, material);
    }


    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );
        
        //gl.useProgram( this.program );
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
    static from_obj_text( gl, program, text, material ) {
        let verts = [];
        let indis = [];

        let lines = text.split( /\r?\n/ );
        let color_change = 0;
        for(var index = 0; index < lines.length; index++)
        {
            let line = lines[index].trim();
            let parts_of_line = line.split( /(\s+)/ );

            if(parts_of_line[0] === 'v')
            {
                verts.push(parts_of_line[2], parts_of_line[4], parts_of_line[6]); // vertices
                verts.push(0.53+color_change, 0.8+color_change, 0.67+color_change, 1); // colors
                color_change+=0.000045
                let norm = new Vec4(parts_of_line[2],parts_of_line[4],parts_of_line[6],0).norm();
                verts.push(norm.x, norm.y, norm.z);
            }

            if(parts_of_line[0] === 'f')
            {
                indis.push(parts_of_line[2]-1, parts_of_line[4]-1, parts_of_line[6]-1); // indices
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
    static from_obj_file( gl, file_name, program, f, material) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText, material );

            console.log( 'loaded ', file_name );
            f( loaded_mesh );
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}
