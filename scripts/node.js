class Node {
    /** 
     * Creates a new node
    */
    constructor( data ) {
        this.position = new Vec4(0,0,0,1);
        this.scale = new Vec4(1,1,1,1);
        this.roll = 0;
        this.pitch = 0;
        this.yaw = 0;
        this.data = data;
        this.children = [];
        this.type = 0;
    };

    add_child(){
        let child = new Node();
        this.children.push(child);
        return child;
    };

    del_child(child){
        const index = this.children.indexOf(child);
        if (index > -1) { // only splice array when item is found
            this.children.splice(index, 1); // 2nd parameter means remove one item only
        };
    };

    get_matrix(){
        let matrix = new Mat4();
       
        matrix = matrix.mul(Mat4.translation(this.position.x, this.position.y, this.position.z));
        matrix = matrix.mul(Mat4.rotation_xz(this.yaw));
        matrix = matrix.mul(Mat4.rotation_yz(this.pitch));
        matrix = matrix.mul(Mat4.rotation_xy(this.roll));
        matrix = matrix.mul(Mat4.scale(this.scale.x, this.scale.y, this.scale.z));
        return matrix;
    };


};

class RenderMesh{
    constructor(matrix, mesh){
        this.matrix = matrix;
        this.mesh = mesh;
    };
};

class RenderLight{
    constructor(location, color, type){
        this.location = location;
        this.color = color;
        this.type = type;
    };
};