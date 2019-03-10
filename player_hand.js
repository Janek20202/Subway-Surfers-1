/// <reference path="webgl.d.ts" />

let player_hand = class {
	constructor(gl, pos, url, flag1, flag2) {
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		
        var dim = 0.2;
        var len = 1;
        if(flag2)
            this.positions = makeCuboid(-0.5, 0, -0.5, dim, dim, len);
        else
            this.positions = makeCuboid(0.5, 0, -0.5, dim, dim, len);

        this.pos = pos;
        this.flag = flag1;
        this.vel = 0;
		this.velx = 0;
        this.rotation = 0;
		this.jet = 0;
		this.jumping_boot = 0;
		this.slow = 10;
		this.right = 0;
        this.dead = false;
		this.leg = false;
		this.gravity = true;
		this.duck = false;

        if(flag1 != flag2)
            this.leg = true;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		
		const textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

		const textureCoordinates = [
			// Front
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Back
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Top
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Bottom
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Right
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Left
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

		// Build the element array buffer; this specifies the indices
		// into the vertex arrays for each face's vertices.

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.

		const indices = fillCuboidIndices(0);

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
    
    tick(deltaTime, flag, p_body) {
        if(this.flag)
            this.rotation += 0.05;
        else
            this.rotation -= 0.05;
        
        if(this.rotation >= Math.PI / 3)
            this.flag = !this.flag;
        if(this.rotation <= -Math.PI / 3)
			this.flag = !this.flag;
		if(flag > 0)
		{
			if(p_body.slow > 0)
			{
				if(this.pos[1] < p_body.pos[1] - 5)
					this.pos[1] += frame_speed/20;
			}
			else
			{
				if(this.pos[1] > p_body.pos[1] - 10)
					this.pos[1] += 2 * frame_speed  * deltaTime - frame_speed/20;
				else
					this.pos[1] = p_body.pos[1] - 10;
			}
		}
		if(flag == 1)
		{
			this.pos[0] = p_body.pos[0] - 0.7;
	    	this.pos[2] = p_body.pos[2] - 0.25;
		}
		else if(flag == 2)
		{
			this.pos[0] = p_body.pos[0] + 0.7;
	    	this.pos[2] = p_body.pos[2] - 0.25;
		}
		else if(flag == 3)
		{
			this.pos[0] = p_body.pos[0] - 1;
			this.pos[2] = p_body.pos[2] - 0.6;
		}
		else if(flag == 4)
		{
			this.pos[0] = p_body.pos[0] + 1;
			this.pos[2] = p_body.pos[2] - 0.6;
		}
		else if(flag == 0)
		{
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
				var tmp = -2;
				if(this.leg)
					tmp -= 0.5;
				if(this.pos[2] < tmp)
				{
					this.pos[2] = tmp;
					this.vel = 0;
					return;
				}
				this.pos[2] += this.vel * deltaTime + (accel * deltaTime * deltaTime) / 2;
				this.vel += accel * deltaTime;
			}
			else if(this.jet > 0)
			{
				if(this.leg)
					if(this.pos[2] <= 9.5)
						this.pos[2] += deltaTime * 8;
				else
					if(this.pos[2] <= 10)
						this.pos[2] += deltaTime * 8;
			}
		}
    }

	draw(gl, projectionMatrix, programInfo, deltaTime) {
		const modelViewMatrix = mat4.create();
		mat4.translate(
			modelViewMatrix,
			modelViewMatrix,
			this.pos
        );

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
        
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0.5]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [1, 0, 0]);
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -0.5]);
		
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
			const vertexCount = 36;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}
};