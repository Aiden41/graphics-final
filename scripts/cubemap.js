 /** 
  * 
  * @param {WebGLRenderingContext} gl  
  * @param {number} faces
  * 
  * @returns {WebGLTexture}
 */
async function loadCubemap(gl,faces)
{
    let textureID = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureID);

    for (let i = 0; i < faces.length; i++)
    {
        const image = new Image();
        
        await new Promise((resolve) => {
            image.onload = resolve;
        });

        gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,0, gl.RGBA,
            256, 256, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            image
        );

        image.src = faces[i];
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    return textureID;
}  