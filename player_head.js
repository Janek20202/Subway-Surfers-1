/// <reference path="webgl.d.ts" />

let player_head = class {
	constructor(gl, pos, url) {
		this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        
        this.n = 20;
        var rad = 0.25;
        var ht = 0.25;
		
        this.positions = drawCyl(0, 0, ht/2 + 0.5, this.n, rad, rad, ht);
        this.positions = this.positions.concat(drawPol(this.n, 0, 0, rad, ht + 0.5));

		this.pos = pos;
		this.velx = 0;
		this.rotation = 0;
		this.vel = 0;
		this.jet = 0;
		this.jumping_boot = 0;
		this.slow = 10;
		this.right = 0;
        this.dead = false;
		this.leg = false;
		this.gravity = true;
		this.rotation = 0;
		this.duck = false;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		
		const textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

        var textureCoordinates = [];
        for(i=0;i<9*this.n;i++)
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

		const indices = fillSeqIndices(9*this.n);

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
    
    tick(deltaTime) {

		this.pos[0] += this.velx * deltaTime;

		if(this.right == -1 && Math.abs(this.pos[0] + 4) <= 0.5)
		{
			this.velx = 0
			this.pos[0] = -4;
		}
		if(this.right == 0 && Math.abs(this.pos[0]) <= 0.5)
		{
			this.velx = 0
			this.pos[0] = 0;
		}
		if(this.right == 1 && Math.abs(this.pos[0] - 4) <= 0.5)
		{
			this.velx = 0
			this.pos[0] = 4;
		}

		if(this.slow > 0)
			this.slow -= deltaTime;
		else
			this.slow = 0;

		if(this.jet > 0)
			this.jet -= deltaTime;
		else
			this.jet = 0;
		
		if(this.jumping_boot > 0)
			this.jumping_boot -= deltaTime;
		else
			this.jumping_boot = 0;

		if(this.jet == 0 && this.gravity)
		{
			var accel = -14;
			if(this.pos[2] < -2)
			{
				this.pos[2] = -2;
				this.vel = 0;
				return;
			}
			this.pos[2] += this.vel * deltaTime + (accel * deltaTime * deltaTime) / 2;
			this.vel += accel * deltaTime;
		}
		else if(this.jet > 0)
			if(this.pos[2] <= 10)
				this.pos[2] += deltaTime * 8;
    }

	draw(gl, projectionMatrix, programInfo, deltaTime) {
		const modelViewMatrix = mat4.create();
		mat4.translate(
			modelViewMatrix,
			modelViewMatrix,
			this.pos
		);

		if(this.jet > 0)
		{
			if(this.rotation < Math.PI/2)
				this.rotation += 0.03;
		}
		else if(this.jet <= 0)
		{
			if(this.rotation > 0)
				this.rotation -= 0.03;
		}
		if(this.duck)
		{
			if(this.rotation >= -Math.PI / 2)
				this.rotation -= 0.03;
			else
				this.duck = false;
		}
		else
		{
			if(this.rotation < 0)
				this.rotation += 0.03;
		}
		mat4.rotate(modelViewMatrix, modelViewMatrix, -this.rotation, [1, 0, 0]);

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
			const vertexCount = 9 * this.n;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}
};