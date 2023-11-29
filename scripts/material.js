class Material {
    /** 
     * Creates a new material
     * 
     *  
     * @param {number} ambient
     * @param {number} diffuse
     * @param {number} specular
     * @param {number} shininess
     * @param {texture} texture
    */
    constructor( ambient, diffuse, specular, shininess, texture ) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.texture = texture;
    };
}