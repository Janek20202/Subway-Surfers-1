/// <reference path="webgl.d.ts" />

let dog_legs = class {
	constructor(gl, pos, url) {
		this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        
        var ht = 0.6;
        var dim = 0.15;
        var r = 0.3;

        this.positions = makeCuboid(-r, 0.5, -ht/2, dim, dim, ht);
        this.positions = this.positions.concat(makeCuboid(r, 0.5, -ht/2, dim, dim, ht));
        this.positions = this.positions.concat(makeCuboid(-r, -0.5, -ht/2, dim, dim, ht));
		this.positions = this.positions.concat(makeCuboid(r, -0.5, -ht/2, dim, dim, ht));
		this.rotation = 0;

		this.pos = pos;
		this.flag = true;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		
		const textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

        let textureCoordinates = [];
        for(i=0;i<4*4;i++)
        {
            textureCoordinates.push(0.0)
            textureCoordinates.push(0.0)
            textureCoordinates.push(1.0)
            textureCoordinates.push(0.0)
            textureCoordinates.push(1.0)
            textureCoordinates.push(1.0)
            textureCoordinates.push(0.0)
            textureCoordinates.push(1.0)
        }

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

		// Build the element array buffer; this specifies the indices
		// into the vertex arrays for each face's vertices.

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.

		let indices = fillCuboidIndices(0);
		indices = indices.concat(fillCuboidIndices(indices.length));
		indices = indices.concat(fillCuboidIndices(indices.length));
		indices = indices.concat(fillCuboidIndices(indices.length));

        // Now send the element array to GL

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

		this.buffer = {
			position: this.positionBuffer,
			textureCoord: textureCoordBuffer,
			indices: indexBuffer,
		}
		this.texture = loadTexture(gl, url);

	}
	
	tick(p) {
		if(this.flag)
			this.rotation += 0.05;
		else
			this.rotation -= 0.05;

		if(this.rotation >= Math.PI / 9)
			this.flag = !this.flag;
		else if(this.rotation <= -Math.PI/9)
			this.flag = !this.flag;

		if(p.right == 1)
			this.pos[0] = p.pos[0] - 2;
		else
			this.pos[0] = p.pos[0] + 2;
		this.pos[1] = p.pos[1] - 3;
	}
    
	draw(gl, projectionMatrix, programInfo, deltaTime) {
		const modelViewMatrix = mat4.create();
		mat4.translate(
			modelViewMatrix,
			modelViewMatrix,
			this.pos
		);

		mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0.4]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [1, 0, 0]);
		mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -0.4]);

		{
			const numComponents = 3;
			const type = gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
			gl.vertexAttribPointer(
				programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			gl.enableVertexAttribArray(
				programInfo.attribLocations.vertexPosition);
		}

		{
			const num = 2; // every coordinate composed of 2 values
			const type = gl.FLOAT; // the data in the buffer is 32 bit float
			const normalize = false; // don't normalize
			const stride = 0; // how many bytes to get from one set to the next
			const offset = 0; // how many bytes inside the buffer to start from
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.textureCoord);
			gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
			gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
		}


		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

		gl.useProgram(programInfo.program);

		gl.uniformMatrix4fv(
			programInfo.uniformLocations.projectionMatrix,
			false,
			projectionMatrix);
		gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix);

		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        // Tell WebGL which indices to use to index the vertices

		{
			const vertexCount = 36*4;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}
};