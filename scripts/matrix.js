/**
 * Matrix with row-major layout:
 *  0       1       2       3
 *  4       5       6       7
 *  8       9       10      11
 *  12      13      14      15
 */
class Mat4 {

    constructor( data ) {
        if( data == null ) {
            this.data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]
        }
        else {
            this.data = data;
        }
    }

    static identity() {
        return new Mat4();
    }

    toString() {
        var str_vals = this.data.map( function( val ) { return "" + val } )
        var str = 
            str_vals.slice( 0, 4 ).join(' ') + '; ' + 
            str_vals.slice( 4, 8 ).join(' ') + '; ' +
            str_vals.slice( 8, 12 ).join(' ') + '; ' +
            str_vals.slice( 12, 16 ).join(' ');

        return '[' + str + ']';
    }

    /**
     * Returns a rotation matrix in the XY plane, rotating by the given number of turns. 
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xy( turns ) {
        const rad = turns * 2 * Math.PI
        return new Mat4([
            Math.cos(rad), Math.sin(rad), 0, 0,
            -Math.sin(rad), Math.cos(rad), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        // return the rotation matrix
    }

    /**
     * Returns a rotation matrix in the XZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xz( turns ) {
        const rad = turns * 2 * Math.PI
        return new Mat4([
            Math.cos(rad), 0, Math.sin(rad), 0,
            0, 1, 0, 0,
            -Math.sin(rad), 0, Math.cos(rad), 0,
            0, 0, 0, 1
        ]);
        // return the rotation matrix
    }

    /**
     * Returns a rotation matrix in the YZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_yz( turns ) {
        const rad = turns * 2 * Math.PI
        return new Mat4([
            1, 0, 0, 0,
            0, Math.cos(rad), Math.sin(rad), 0,
            0, -Math.sin(rad), Math.cos(rad), 0,
            0, 0, 0, 1
        ]);
        // return the rotation matrix
    }

    static translation( dx, dy, dz ) {
        return new Mat4([
            1, 0, 0, dx,
            0, 1, 0, dy,
            0, 0, 1, dz,
            0, 0, 0, 1
        ]);
        // return the translation matrix
    }

    static scale( sx, sy, sz ) {
        return new Mat4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ]);
        // return the scaling matrix
    }

    static frustum(left, right, bottom, top, near, far){
        const sx = (2 * near) / (right - left);
        const sy = (2 * near) / (top - bottom);
        const c2 = (far+near)/(far-near);
        const c1 = (2*far*near)/(far-near);
        return new Mat4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, c2, -c1,
            0, 0, 1, 0
        ]);
        // return the frustum matrix
    }

    basis_x(){
        return new Vec4(this.data[0], this.data[4], this.data[8], this.data[12]);
    }

    basis_y(){
        return new Vec4(this.data[1], this.data[5], this.data[9], this.data[13]);
    }

    basis_z(){
        return new Vec4(this.data[2], this.data[6], this.data[10], this.data[14]);
    }

    basis_w(){
        return new Vec4(this.data[3], this.data[7], this.data[11], this.data[15]);
    }

    mul( right ) {
        let arr = [];
        for(let i = 0; i<16; i=i+4)
        {
            for(let j = 0; j<4; j++)
            {
                arr.push(this.data[i]*right.data[j] + this.data[i+1]*right.data[j+4] + this.data[i+2]*right.data[j+8]+this.data[i+3]*right.data[j+12]);
            }
        }

        return new Mat4(arr);
        // return the result of multiplication
    }

	// right multiply by column vector
    transform( x, y, z, w ) {
        return this.transform_vec( new Vec4( x, y, z, w ) );
    }

    transform_vec( vec ) {
        let arr = [
            (vec.x*this.data[0] + vec.y*this.data[1] + vec.z*this.data[2] + vec.w*this.data[3]),
            (vec.x*this.data[4] + vec.y*this.data[5] + vec.z*this.data[6] + vec.w*this.data[7]),
            (vec.x*this.data[8] + vec.y*this.data[9] + vec.z*this.data[10] + vec.w*this.data[11]),
            (vec.x*this.data[12] + vec.y*this.data[13] + vec.z*this.data[14] + vec.w*this.data[15])
        ]
        return new Vec4(arr[0], arr[1], arr[2], arr[3])
        // return the transformed vector
    }


    rc( row, col ) {
        return this.data[ row * 4 + col ]
    }

    // inverting a 4x4 matrix is ugly, there are 16 determinants we 
    // need to calculate. Because it's such a pain, I looked it up:
    // https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
    // author: willnode
    inverse() {
        // var A2323 = m.m22 * m.m33 - m.m23 * m.m32 ;
        const A2323 = this.rc(2, 2) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 2); 
        
        // var A1323 = m.m21 * m.m33 - m.m23 * m.m31 ;
        const A1323 = this.rc(2, 1) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 1);
        
        // var A1223 = m.m21 * m.m32 - m.m22 * m.m31 ;
        const A1223 = this.rc(2, 1) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 1);

        // var A0323 = m.m20 * m.m33 - m.m23 * m.m30 ;
        const A0323 = this.rc(2, 0) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 0);

        // var A0223 = m.m20 * m.m32 - m.m22 * m.m30 ;
        const A0223 = this.rc(2, 0) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 0);

        // var A0123 = m.m20 * m.m31 - m.m21 * m.m30 ;
        const A0123 = this.rc(2, 0) * this.rc(3, 1) - this.rc(2, 1) * this.rc(3, 0);

        // var A2313 = m.m12 * m.m33 - m.m13 * m.m32 ;
        const A2313 = this.rc(1, 2) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 2);

        // var A1313 = m.m11 * m.m33 - m.m13 * m.m31 ;
        const A1313 = this.rc(1, 1) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 1);

        // var A1213 = m.m11 * m.m32 - m.m12 * m.m31 ;
        const A1213 = this.rc(1, 1) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 1);

        // var A2312 = m.m12 * m.m23 - m.m13 * m.m22 ;
        const A2312 = this.rc(1, 2) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 2);

        // var A1312 = m.m11 * m.m23 - m.m13 * m.m21 ;
        const A1312 = this.rc(1, 1) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 1);

        // var A1212 = m.m11 * m.m22 - m.m12 * m.m21 ;
        const A1212 = this.rc(1, 1) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 1);

        // var A0313 = m.m10 * m.m33 - m.m13 * m.m30 ;
        const A0313 = this.rc(1, 0) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 0);

        // var A0213 = m.m10 * m.m32 - m.m12 * m.m30 ;
        const A0213 = this.rc(1, 0) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 0);
        
        // var A0312 = m.m10 * m.m23 - m.m13 * m.m20 ;
        const A0312 = this.rc(1, 0) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 0);

        // var A0212 = m.m10 * m.m22 - m.m12 * m.m20 ;
        const A0212 = this.rc(1, 0) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 0);

        // var A0113 = m.m10 * m.m31 - m.m11 * m.m30 ;
        const A0113 = this.rc(1, 0) * this.rc(3, 1) - this.rc(1, 1) * this.rc(3, 0);
        
        // var A0112 = m.m10 * m.m21 - m.m11 * m.m20 ;
        const A0112 = this.rc(1, 0) * this.rc(2, 1) - this.rc(1, 1) * this.rc(2, 0);
        

        const det = 
        this.rc(0, 0) * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ) -
        this.rc(0, 1) * ( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ) +
        this.rc(0, 2) * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ) -
        this.rc(0, 3) * ( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 );

        const dr = 1.0 / det;

        return new Mat4( [
            dr * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ),
            dr *-( this.rc(0, 1) * A2323 - this.rc(0, 2) * A1323 + this.rc(0, 3) * A1223 ),
            dr * ( this.rc(0, 1) * A2313 - this.rc(0, 2) * A1313 + this.rc(0, 3) * A1213 ),
            dr *-( this.rc(0, 1) * A2312 - this.rc(0, 2) * A1312 + this.rc(0, 3) * A1212 ),

            dr *-( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ),
            dr * ( this.rc(0, 0) * A2323 - this.rc(0, 2) * A0323 + this.rc(0, 3) * A0223 ),
            dr *-( this.rc(0, 0) * A2313 - this.rc(0, 2) * A0313 + this.rc(0, 3) * A0213 ),
            dr * ( this.rc(0, 0) * A2312 - this.rc(0, 2) * A0312 + this.rc(0, 3) * A0212 ),

            dr * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ),
            dr *-( this.rc(0, 0) * A1323 - this.rc(0, 1) * A0323 + this.rc(0, 3) * A0123 ),
            dr * ( this.rc(0, 0) * A1313 - this.rc(0, 1) * A0313 + this.rc(0, 3) * A0113 ),
            dr *-( this.rc(0, 0) * A1312 - this.rc(0, 1) * A0312 + this.rc(0, 3) * A0112 ),

            dr *-( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 ),
            dr * ( this.rc(0, 0) * A1223 - this.rc(0, 1) * A0223 + this.rc(0, 2) * A0123 ),
            dr *-( this.rc(0, 0) * A1213 - this.rc(0, 1) * A0213 + this.rc(0, 2) * A0113 ),
            dr * ( this.rc(0, 0) * A1212 - this.rc(0, 1) * A0212 + this.rc(0, 2) * A0112 ),
        ] );
    }

    clone() {
        let c = new Array(16);
        for( let i = 0; i < 16; i++ ) { c[i] = this.data[i]; }
        return new Mat4( c );
    }
	
	toString() {
		let pieces = [ '[' ];
		
		for( let row = 0; row < 4; row ++ ){
			pieces.push( '[' );
			
			for( let col = 0; col < 4; col ++ ){
				let i = row * 4 + col;
				pieces.push( this.data[i] );
			}
			
			pieces.push( ']' )
		}
		
		pieces.push( ']' );
		
		return pieces.join( ' ' );
	}
}