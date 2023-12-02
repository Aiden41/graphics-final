class Vec4 {

    constructor( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w ?? 0;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec4}
     */
    scaled( by ) {
        return new Vec4(this.x*by, this.y*by, this.z*by, this.w*by);
        // return the new vector
    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec4} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        return (this.x*other.x)+(this.y*other.y)+(this.z*other.z)+(this.w*other.w);
        // return the dot product 
    }

    /**
     * Returns the length of this vector
     * @returns {number}
     */
    length() {
        return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2)+Math.pow(this.z, 2)+Math.pow(this.w, 2));
        // return the length
    }

    /**
     * Returns a normalized version of this vector
     * @returns {Vec4}
     */
    norm() {
        return this.scaled(1/this.length());
        // return the normalized vector
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec4} other 
     */
    add( other ) {
        return new Vec4(this.x+other.x, this.y+other.y, this.z+other.z, this.w+other.w);
        // return the vector sum
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x;
        let z = this.x * other.y - this.y * other.x;

        return new Vec4( x, y, z, 0 );
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, this.w, ']' ].join( ' ' );
	}

    normal_of_triangle(v1, v2, v3){
        return (v2.sub(v1)).cross((v3.sub(v1)));
    }
}