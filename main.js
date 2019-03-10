var cubeRotation = 0.0;
var trackLen = 15;
var trackWid = 4;

var p_head;
var p_body;
var p_hand1;
var p_hand2;
var p_leg1;
var p_leg2;
var o;
var o_head;
var o_hand1;
var o_hand2;
var o_leg1;
var o_leg2;
var d_body;
var d_legs;
var d_tail;
var game_won;
var t = [];
var walls = [];
var train_tops = [];
var train_sides = [];
var train_fronts = [];
var coins = [];
var obstacles11 = [];
var obstacles12 = [];
var obstacles21 = [];
var obstacles22 = [];
var jetpacks = [];
var jumping_boots = [];
var magnets = [];

var fr = 0.5;
var progress;
var start = 5;
var end = 750;
var done = 0;
var frame_speed = 5;
var frame_accel = 0.5;
var pause_status = false;
var grayscale = false;
var train_len = 3;
var train_wid = 3;
var train_ht = 3;
var groundPos = -3.0;
var slowTime = 8;
var light = 0;

// going into the screen is y-axis, up the screen is z-axis
function draw(gl, programInfo, lightProgramInfo, deltaTime) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = 45 * Math.PI / 180;   // in radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix,
					 fieldOfView,
					 aspect,
					 zNear,
					 zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	var cameraMatrix = mat4.create();
	var cameraPosition = [
		p_body.pos[0],
		p_body.pos[1] - 15,
		p_body.pos[2] + 5,
	];

	var up = [0, 0, 1];

	mat4.lookAt(cameraMatrix, cameraPosition, [p_body.pos[0], p_body.pos[1], p_body.pos[2] + 2], up);

	var viewMatrix = cameraMatrix;//mat4.create();

	//mat4.invert(viewMatrix, cameraMatrix);

	var viewProjectionMatrix = mat4.create();

	mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    p_body.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    p_head.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    game_won.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    if(p_body.jet <= 0 && !p_body.duck)
    {
        p_hand1.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
        p_hand2.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
        p_leg1.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
        p_leg2.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    }
    o.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    o_head.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    o_hand1.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    o_hand2.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    o_leg1.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    o_leg2.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    d_body.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    d_legs.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    d_tail.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<t.length;i++)
        t[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<walls.length;i++)
    {
        if(light%60 < 30)
            walls[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
        else
            walls[i].draw(gl, viewProjectionMatrix, lightProgramInfo, deltaTime);
    }
    light++;
    for(i=0;i<train_fronts.length;i++)
        train_fronts[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<train_sides.length;i++)
        train_sides[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<train_tops.length;i++)
        train_tops[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<coins.length;i++)
        coins[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<obstacles11.length;i++)
        obstacles11[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<obstacles12.length;i++)
        obstacles12[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<obstacles21.length;i++)
        obstacles21[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<obstacles22.length;i++)
        obstacles22[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<jetpacks.length;i++)
        jetpacks[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<jumping_boots.length;i++)
        jumping_boots[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    for(i=0;i<magnets.length;i++)
        magnets[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);

}

main();

function main() {


	const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    p_head  = new player_head(gl, [0, 5, groundPos + 1.5], 'player_head.jpg');
    p_body = new player_body(gl, [0, 5, groundPos + 1.5], 'player_body.jpg');
    p_hand1 = new player_hand(gl, [0, 5, groundPos + 1.5], 'player.jpg', true, true);
    p_hand2 = new player_hand(gl, [0, 5, groundPos + 1.5], 'player.jpg', false, false);
    p_leg1 = new player_hand(gl, [-0.2, 5, groundPos + 1], 'player.jpg', true, false);
    p_leg2 = new player_hand(gl, [0.2, 5, groundPos + 1], 'player.jpg', false, true);

    o = new officer(gl, [p_body.pos[0], p_body.pos[1], groundPos + 0.75], 'officer.jpeg');
    o_head = new officer_head(gl, [p_body.pos[0], p_body.pos[1] - 1, groundPos + 1.75], 'officer_head.jpg');
    o_hand1 = new player_hand(gl, [0, 5, groundPos + 1.5], 'officer.jpeg', true, true);
    o_hand2 = new player_hand(gl, [0, 5, groundPos + 1.5], 'officer.jpeg', false, false);
    o_leg1 = new player_hand(gl, [0, 5, groundPos + 1.5], 'officer.jpeg', true, false);
    o_leg2 = new player_hand(gl, [0, 5, groundPos + 1.5], 'officer.jpeg', false, true);

    d_body = new dog_body(gl, [0, 5, groundPos+0.6], 'dog.jpg');
    d_legs = new dog_legs(gl, [0, 5, groundPos+0.6], 'dog.jpg');
    d_tail = new dog_tail(gl, [0, 5-1, groundPos+0.6-0.2], 'dog.jpg');
    game_won = new game_over(gl, [0, end, 0], 'won.jpeg');

    var i,j;

    for(i=0;i<50;i++)
        t.push(new track(gl, [0, 5.0 + trackLen * i, groundPos], 'track.jpeg'));
    for(i=0;i<50;i++)
        t.push(new track(gl, [trackWid, 5.0 + trackLen * i, groundPos], 'track.jpeg'));
    for(i=0;i<50;i++)
        t.push(new track(gl, [-trackWid, 5.0 + trackLen * i, groundPos], 'track.jpeg'));

    for(i=0;i<50;i++)
        walls.push(new wall(gl, [-6.0, 5.0 + trackLen * i, 7 + groundPos], 'wall.jpg'));
    for(i=0;i<50;i++)
        walls.push(new wall(gl, [6.0, 5.0 + trackLen * i, 7 + groundPos], 'wall.jpg'));

    y_pos = 100;
    for(i=0;i<20;i++)
    {
        a = Math.round(Math.random() * 3) % 3;
        a--;
        train_fronts.push(new train_front(gl, [a * trackWid, y_pos, groundPos + train_ht/2], 'train.jpeg', train_len, train_wid, train_ht));
        train_fronts.push(new train_front(gl, [a * trackWid, y_pos + train_len, groundPos + train_ht/2], 'train.jpeg', train_len, train_wid, train_ht));
        for(j=0;j<5;j++)
        {
            train_sides.push(new train_side(gl, [-train_wid/2 + 0.2 + a * trackWid, y_pos + train_len/2 + j*train_len, groundPos + train_ht/2], 'train.jpeg', train_len, train_wid, train_ht))
            train_sides.push(new train_side(gl, [train_wid/2 - 0.1 + a * trackWid, y_pos + train_len/2 + j*train_len, groundPos + train_ht/2], 'train.jpeg', train_len, train_wid, train_ht))
        }
        for(j=0;j<5;j++)
            train_tops.push(new train_top(gl, [a * trackWid, y_pos+train_len/2 + j*train_len, groundPos + train_ht], 'train_top.jpeg', train_len, train_wid, train_ht));
        for(j=0;j<15;j++)
        {
            coins.push(new coin(gl, [a * trackWid, y_pos + j, groundPos + 4], 'coin.jpeg'));
            coins[coins.length - 1].vely = -15;
        }
        y_pos += 100;
    }
    y_pos = 35;
    for(i=0;i<12;i++)
    {
        a = Math.round(Math.random() * 2) % 2;
        if(a==0)
            a=-1;
        obstacles11.push(new obstacle11(gl, [a * 2, y_pos, groundPos + 2.5], 'obstacle11.jpeg'));
        y_pos += 70;
    }

    y_pos = 59;
    for(i=0;i<15;i++)
    {
        a = Math.round(Math.random() * 3) % 3;
        a--;
        obstacles12.push(new obstacle12(gl, [a * trackWid, y_pos, groundPos + 2.0], 'obstacle12.jpg'));
        obstacles12.push(new obstacle12_base(gl, [a * trackWid - 1.25, y_pos, groundPos + 1.0], 'obstacle12.jpg'));
        obstacles12.push(new obstacle12_base(gl, [a * trackWid + 1.25, y_pos, groundPos + 1.0], 'obstacle12.jpg'));
        for(j=-5;j<=5;j++)
        {
            coins.push(new coin(gl, [a * trackWid,y_pos + j,-2.5], 'coin.jpeg'));
        }
        y_pos += 59;
    }

    y_pos = 43;
    for(i=0;i<20;i++)
    {
        a = Math.round(Math.random() * 3) % 3;
        a--;
        if((i%2)==0)
        {
            obstacles21.push(new obstacle21(gl, [a * trackWid, y_pos, groundPos + 0.15], 'obstacle21.jpeg'));
            y_pos += 43;
        }
        else
        {
            obstacles22.push(new obstacle22(gl, [a * trackWid, y_pos, groundPos + 0.15], 'obstacle22.jpeg'));
            y_pos += 49;
        }
    }

    y_pos = 61;
    for(i=0;i<10;i++)
    {
        a = Math.round(Math.random() * 3) % 3;
        a--;
        if(i%3==0)
            magnets.push(new magnet(gl, [a * trackWid, y_pos, groundPos + 0.8], 'magnet.jpeg'));
        else if(i%3==1)
        {
            jetpacks.push(new jetpack(gl, [a * trackWid, y_pos, groundPos + 0.5], 'jetpack.jpeg'));
            for(j=frame_speed;j<12 * frame_speed;j++)
            {
                if(j%10==0)
                {
                    a = Math.round(Math.random() * 3) % 3;
                    a--;
                }
                coins.push(new coin(gl, [a * trackWid,y_pos + j, 10], 'coin.jpeg'));
            }
        }
        else
        {
            jumping_boots.push(new jumping_boot(gl, [a * trackWid - 0.2, y_pos, groundPos + 0.5], 'jumping_boot.jpg', true));
            jumping_boots.push(new jumping_boot(gl, [a * trackWid + 0.12, y_pos, groundPos + 0.2], 'jumping_boot.jpg', false));
        }
        y_pos += 109;
    }

    // coins.push(new coin(gl, [-4,40,-1], 'coin.jpeg'));
    // If we don't have a GL context, give up now
	if (!gl) {
    	alert('Unable to initialize WebGL. Your browser or machine may not support it.');
	    return;
    }
    
    programInfo = shader(gl, 0);
    grayProgramInfo = shader(gl, 1);
    lightProgramInfo = lighting_shader(gl);

	// Vertex shader program

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	//const buffers

	var then = 0;

	// Draw the scene repeatedly
	function render(now) {
    console.log(p_body.magnet);
    progress = (p_body.pos[1] - start)*100 / end;
    progress = Math.round(progress);
    document.getElementById("progress").innerText = progress + " %";
    document.getElementById("progress").setAttribute("style", "width:"+String(progress) + "%");

    if(progress == 100)
        p_body.won = true;
        
    if(p_body.dead || p_body.won)
    {
        if(done<=20 && p_body.dead)
        {
            o_hand1.pos[1] += 0.2;
            o_hand2.pos[1] += 0.2;
            o_leg1.pos[1] += 0.2;
            o_leg2.pos[1] += 0.2;
            o_head.pos[1] += 0.2;
            o.pos[1] += 0.2;
            done++;
        }
        frame_speed = 0;
        frame_accel = 0;
    }
	now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    if(!p_body.dead && !p_body.won)
        key_bindings();
    if(!pause_status && !p_body.dead && !p_body.won)
        tick(deltaTime);
    then = now;
    document.getElementById("score").innerText = "Score : " +p_body.score;
    if(p_body.dead)
        document.getElementById("over").innerText = "Game Over";
    if(p_body.won)
        document.getElementById("over").innerText = "You Won";

    if(grayscale)
        draw(gl, grayProgramInfo, grayProgramInfo, deltaTime);
    else
        draw(gl, programInfo, lightProgramInfo, deltaTime);
    detect_collisions();

    requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

function tick(deltaTime) {
    o.tick(p_body, deltaTime);
    o_head.tick(p_body, deltaTime);
    o_hand1.tick(deltaTime, 1, p_body);
    o_hand2.tick(deltaTime, 2, p_body);
    o_leg1.tick(deltaTime, 3, p_body);
    o_leg2.tick(deltaTime, 4, p_body);

    d_body.tick(p_body);
    d_legs.tick(p_body);
    d_tail.tick(p_body);
    p_body.tick(deltaTime);
    p_head.tick(deltaTime);
    p_hand1.tick(deltaTime, 0, p_body);
    p_hand2.tick(deltaTime, 0, p_body);
    p_leg1.tick(deltaTime, 0, p_body);
    p_leg2.tick(deltaTime, 0, p_body);
    p_body.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    p_head.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    p_hand1.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    p_hand2.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    p_leg1.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    p_leg2.pos[1] += frame_speed * deltaTime + (frame_accel * deltaTime * deltaTime) / 2;
    frame_speed += frame_accel * deltaTime;

    for(i=0;i<coins.length;i++)
        coins[i].tick(deltaTime);
    for(i=0;i<train_fronts.length;i++)
        train_fronts[i].tick(deltaTime);
    for(i=0;i<train_tops.length;i++)
        train_tops[i].tick(deltaTime);
    for(i=0;i<train_sides.length;i++)
        train_sides[i].tick(deltaTime);
    if(p_body.magnet > 0)
    {
        for(i=0;i<coins.length;i++)
        {
            var d = dist(coins[i].pos, p_body.pos);
            if(d <= 8)
            {
                coins[i].velx = frame_speed*2*(p_body.pos[0] - coins[i].pos[0])/d;
                coins[i].vely = frame_speed*2*(p_body.pos[1] - coins[i].pos[1])/d;
                coins[i].velz = frame_speed*2*(p_body.pos[2] - coins[i].pos[2])/d;
            }
        }
    }

}

function dist(pos1, pos2) {
    x1 = pos1[0];
    y1 = pos1[1];
    z1 = pos1[2];
    x2 = pos2[0];
    y2 = pos2[1];
    z2 = pos2[2];
    return Math.sqrt(((x1-x2) * (x1-x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2)));
}

function detect_collisions() {

    plBx = createBoundingBox(p_body.pos[0], p_body.pos[1], p_body.pos[2] - 0.375, 1, 1, 2.25);

    for(i=0;i<coins.length;i++)
    {
        coinBx = createBoundingBox(coins[i].pos[0], coins[i].pos[1], coins[i].pos[2], 0.3, 0.3, 0.3);
        if(detect_collision(plBx, coinBx))
        {
            p_body.score += 10;
            coins.splice(i, 1);
        }
    }

    for(i=0;i<train_fronts.length;i++)
    {
        trBx = createBoundingBox(train_fronts[i].pos[0], train_fronts[i].pos[1], train_fronts[i].pos[2], 3, 0.1, 3);
        if(detect_collision(plBx, trBx) && p_body.jet <= 0)
            p_body.dead = true;
    }
    for(i=0;i<train_tops.length;i++)
    {
        trBx = createBoundingBox(train_tops[i].pos[0], train_tops[i].pos[1], train_tops[i].pos[2], 3, 3, 0.1);
        if(detect_collision(plBx, trBx) && p_body.jet <= 0)
        {
            p_body.gravity = false;
            p_head.gravity = false;
            p_hand1.gravity = false;
            p_hand2.gravity = false;
            p_leg1.gravity = false;
            p_leg2.gravity = false;
            if(p_body.vel < 0)
            {
                p_leg1.vel = 0;
                p_hand2.vel = 0;
                p_hand1.vel = 0;
                p_head.vel = 0;
                p_body.vel = 0;
                p_leg2.vel = 0;
            }
        }
        else if(!detect_collision(plBx, trBx))
        {
            p_body.gravity = true;
            p_head.gravity = true;
            p_hand1.gravity = true;
            p_hand2.gravity = true;
            p_leg1.gravity = true;
            p_leg2.gravity = true;
        }
    }

    for(i=0;i<train_sides.length;i++)
    {
        trBx = createBoundingBox(train_sides[i].pos[0], train_sides[i].pos[1], train_sides[i].pos[2], 0.1, 3, 3);
        if(detect_collision(plBx, trBx) && p_body.jet <= 0)
        {
            if(p_body.slow <= 0)
            {
                p_body.slow = slowTime;
                frame_speed = frame_speed * fr;
            }
            else
                p_body.dead = true;
            if(p_body.velx > 0)
            {
                p_body.pos[0]-=1;
                p_head.pos[0]-=1;
                p_hand1.pos[0]-=1;
                p_hand2.pos[0]-=1;
                p_leg1.pos[0]-=1;
                p_leg2.pos[0]-=1;
                p_body.right--;
                p_head.right--;
                p_hand1.right--;
                p_hand2.right--;
                p_leg1.right--;
                p_leg2.right--;
            }
            else if(p_body.velx < 0)
            {
                p_body.pos[0]+=1;
                p_head.pos[0]+=1;
                p_hand1.pos[0]+=1;
                p_hand2.pos[0]+=1;
                p_leg1.pos[0]+=1;
                p_leg2.pos[0]+=1;
                p_body.right++;
                p_head.right++;
                p_hand1.right++;
                p_hand2.right++;
                p_leg1.right++;
                p_leg2.right++;
            }
            p_head.velx = -p_head.velx;
            p_hand1.velx = -p_hand1.velx;
            p_hand2.velx = -p_hand2.velx;
            p_leg1.velx = -p_leg1.velx;
            p_leg2.velx = -p_leg2.velx;
            p_body.velx = -p_body.velx;
        }
    }

    for(i=0;i<walls.length;i++)
    {
        wlBx = createBoundingBox(walls[i].pos[0], walls[i].pos[1], walls[i].pos[2], 0.2, 15, 15);
        if(detect_collision(plBx, wlBx))
        {
            if(p_body.right == -2)
            {
                p_body.right++;
                p_head.right++;
                p_hand1.right++;
                p_hand2.right++;
                p_leg1.right++;
                p_leg2.right++;
                p_body.pos[0]+=1;
                p_head.pos[0]+=1;
                p_hand1.pos[0]+=1;
                p_hand2.pos[0]+=1;
                p_leg1.pos[0]+=1;
                p_leg2.pos[0]+=1;
            }
            else if(p_body.right == 2)
            {
                p_body.right--;
                p_head.right--;
                p_hand1.right--;
                p_hand2.right--;
                p_leg1.right--;
                p_leg2.right--;
                p_body.pos[0]-=1;
                p_head.pos[0]-=1;
                p_hand1.pos[0]-=1;
                p_hand2.pos[0]-=1;
                p_leg1.pos[0]-=1;
                p_leg2.pos[0]-=1;
            }
            p_body.velx = -p_body.velx;
            p_head.velx = -p_head.velx;
            p_hand1.velx = -p_hand1.velx;
            p_hand2.velx = -p_hand2.velx;
            p_leg1.velx = -p_leg1.velx;
            p_leg2.velx = -p_leg2.velx;
            if(p_body.slow <= 0)
            {
                p_body.slow = slowTime;
                frame_speed = fr * frame_speed;
            }
            else
                p_body.dead = true;
        }
    }

    for(i=0;i<obstacles11.length;i++)
    {
        obBx = createBoundingBox(obstacles11[i].pos[0], obstacles11[i].pos[1], obstacles11[i].pos[2], 6, 0.2, 5);
        if(detect_collision(plBx, obBx) && p_body.jet <= 0)
            p_body.dead = true;
    }

    for(i=0;i<obstacles21.length;i++)
    {
        obBx = createBoundingBox(obstacles21[i].pos[0], obstacles21[i].pos[1], obstacles21[i].pos[2], 2, 0.2, 0.3);
        if(detect_collision(plBx, obBx) && p_body.jet <= 0)
        {
            if(p_body.slow <= 0)
            {
                p_body.slow = slowTime;
                frame_speed = fr * frame_speed;
                p_body.pos[1] += 1.5;
                p_hand1.pos[1] += 1.5;
                p_hand2.pos[1] += 1.5;
                p_head.pos[1] += 1.5;
                p_leg1.pos[1] += 1.5;
                p_leg2.pos[1] += 1.5;
            }
            else
                p_body.dead = true;
        }
    }

    for(i=0;i<obstacles22.length;i++)
    {
        obBx = createBoundingBox(obstacles22[i].pos[0], obstacles22[i].pos[1], obstacles22[i].pos[2], 2, 2, 0.3);
        if(detect_collision(plBx, obBx) && p_body.jet <= 0)
        {
            if(p_body.slow <= 0)
            {
                p_body.slow = slowTime;
                frame_speed = fr * frame_speed;
                p_body.pos[1] += 3.5;
                p_hand1.pos[1] += 3.5;
                p_hand2.pos[1] += 3.5;
                p_head.pos[1] += 3.5;
                p_leg1.pos[1] += 3.5;
                p_leg2.pos[1] += 3.5;
            }
            else
                p_body.dead = true;
        }
    }

    for(i=0;i<jetpacks.length;i++)
    {
        jtBx = createBoundingBox(jetpacks[i].pos[0], jetpacks[i].pos[1], jetpacks[i].pos[2], 0.6, 0.6, 1.5);
        if(detect_collision(plBx, jtBx))
        {
            p_body.jet = 5;
            p_head.jet = 5;
            p_hand1.jet = 5;
            p_hand2.jet = 5;
            p_leg1.jet = 5;
            p_leg2.jet = 5;
            p_body.rotation = 0;
            p_head.rotation = 0;
            p_hand1.rotation = 0;
            p_hand2.rotation = 0;
            p_leg1.rotation = 0;
            p_leg2.rotation = 0;
            p_body.slow = 0;
            jetpacks.splice(i, 1);
        }
    }

    for(i=0;i<jumping_boots.length;i++)
    {
        if(i%2==0)
        {
            jbBx = createBoundingBox(jumping_boots[i].pos[0], jumping_boots[i].pos[1], jumping_boots[i].pos[2], 0.3, 0.3, 0.75);
            if(detect_collision(plBx, jbBx))
            {
                p_body.jumping_boot = 10;
                jumping_boots.splice(i, 2);
            }
        }
        else
        {
            jbBx = createBoundingBox(jumping_boots[i].pos[0], jumping_boots[i].pos[1], jumping_boots[i].pos[2], 0.75, 0.5, 0.5);
            if(detect_collision(plBx, jbBx))
            {
                p_body.jumping_boot = 10;
                jumping_boots.splice(i-1, 2);
            }
        }
    }
    for(i=0;i<magnets.length;i++)
    {
        mgBx = createBoundingBox(magnets[i].pos[0], magnets[i].pos[1], magnets[i].pos[2] - 0.35, 1, 0.2, 0.7);
        if(detect_collision(plBx, mgBx))
        {
            p_body.magnet = 10;
            magnets.splice(i, 1);
        }
    }

    for(i=0;i<obstacles12.length;i++)
    {
        if(p_body.duck)
            plBx = createBoundingBox(p_body.pos[0], -p_body.pos[2]+0.375, p_body.pos[1], 1, 2.25, 1);
        if(i%3==0)
            obBx = createBoundingBox(obstacles12[i].pos[0], obstacles12[i].pos[1], obstacles12[i].pos[2], 2.5, 0.2, 0.5);
        else
            obBx = createBoundingBox(obstacles12[i].pos[0], obstacles12[i].pos[1], obstacles12[i].pos[2], 0.5, 0.2, 2.5);
        if(detect_collision(plBx, obBx) && p_body.jet <= 0)
            p_body.dead = true;
    }
}

function key_bindings(){
    Mousetrap.bind('left', function() {
        if(p_body.right == -1 && p_body.jet > 0)
            return;
        var vel = -10;
        p_body.velx = vel;
        p_head.velx = vel;
        p_hand1.velx = vel;
        p_hand2.velx = vel;
        p_leg1.velx = vel;
        p_leg2.velx = vel;
        p_body.right --;
        p_head.right --;
        p_hand1.right --;
        p_hand2.right --;
        p_leg1.right --;
        p_leg2.right --;
    });
    Mousetrap.bind('right', function() {
        if(p_body.right == 1 && p_body.jet > 0)
            return;
        var vel = 10;
        p_body.velx = vel;
        p_head.velx = vel;
        p_hand1.velx = vel;
        p_hand2.velx = vel;
        p_leg1.velx = vel;
        p_leg2.velx = vel;
        p_body.right ++;
        p_head.right ++;
        p_hand1.right ++;
        p_hand2.right ++;
        p_leg1.right ++;
        p_leg2.right ++;
    });

    Mousetrap.bind('down', function() {
        if(p_body.vel != 0 || p_body.jet > 0)
            return;
        p_body.duck = true;
        p_head.duck = true;
        p_hand1.duck = true;
        p_hand2.duck = true;
        p_leg1.duck = true;
        p_leg2.duck = true;
    });
    
    Mousetrap.bind('g', function() {grayscale = !grayscale;});
  
    Mousetrap.bind('space', function() {
        if(p_body.vel == 0 && p_body.jumping_boot == 0)
        {
            if(p_body.duck)
                return;
            var vel = 13;
            p_body.vel = vel;
            p_hand1.vel = vel;
            p_hand2.vel = vel;
            p_head.vel = vel;
            p_leg1.vel = vel;
            p_leg2.vel = vel;
        }
        else if(p_body.vel == 0 && p_body.jumping_boot != 0)
        {
            vel = 18;
            p_body.vel = vel;
            p_head.vel = vel;
            p_hand1.vel = vel;
            p_hand2.vel = vel;
            p_leg1.vel = vel;
            p_leg2.vel = vel;
        }
    });
  
    Mousetrap.bind('p', function() {pause_status = !pause_status;});
  };
  

function makeCuboid(cx, cy, cz, len, wid, ht) {
    pos = [
        // Front face
        cx + len/2, cy + wid/2, cz + ht/2,
        cx + len/2, cy - wid/2, cz + ht/2,
        cx - len/2, cy - wid/2, cz + ht/2,
        cx - len/2, cy + wid/2, cz + ht/2,
        //Back Face
        cx + len/2, cy + wid/2, cz - ht/2,
        cx + len/2, cy - wid/2, cz - ht/2,
        cx - len/2, cy - wid/2, cz - ht/2,
        cx - len/2, cy + wid/2, cz - ht/2,
        //Top Face
        cx + len/2, cy + wid/2, cz + ht/2,
        cx + len/2, cy + wid/2, cz - ht/2,
        cx - len/2, cy + wid/2, cz - ht/2,
        cx - len/2, cy + wid/2, cz + ht/2,
        //Bottom Face
        cx + len/2, cy - wid/2, cz + ht/2,
        cx + len/2, cy - wid/2, cz - ht/2,
        cx - len/2, cy - wid/2, cz - ht/2,
        cx - len/2, cy - wid/2, cz + ht/2,
        //Left Face
        cx + len/2, cy + wid/2, cz + ht/2,
        cx + len/2, cy + wid/2, cz - ht/2,
        cx + len/2, cy - wid/2, cz - ht/2,
        cx + len/2, cy - wid/2, cz + ht/2,
        //Right Face
        cx - len/2, cy + wid/2, cz + ht/2,
        cx - len/2, cy + wid/2, cz - ht/2,
        cx - len/2, cy - wid/2, cz - ht/2,
        cx - len/2, cy - wid/2, cz + ht/2,
    ];
    return pos
}

function fillCuboidIndices(st) {
    indices = [
    st + 0, st + 1, st + 2,    st + 0, st + 2, st + 3,
    st + 4, st + 5, st + 6,    st + 4, st + 6, st + 7,
    st + 8, st + 9, st + 10,   st + 8, st + 10, st + 11,
    st + 12, st + 13, st + 14, st + 12, st + 14, st + 15,
    st + 16, st + 17, st + 18, st + 16, st + 18, st + 19,
    st + 20, st + 21, st + 22, st + 20, st + 22, st + 23, 
    ];
    return indices
}

function drawRect(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
    pos = [
        x1, y1, z1,
        x2, y2, z2,
        x3, y3, z3,
        x1, y1, z1,
        x4, y4, z4,
        x3, y3, z3,
    ];
    return pos
}

function rotate(x, y, angle, cx, cy) {
    x-=cx;
    y-=cy;
    return [cx + x * Math.cos(angle) - y * Math.sin(angle), cy + x * Math.sin(angle) + y * Math.cos(angle)];
}

function drawPol(n, cx, cy, rad, z_cor) {
    prevx=rad;
    prevy=0.0;
    angle=(2.0/n)*Math.PI;
    pos = [];
    for(i=0;i<3*n;i++)
    {
        if(i%3==0)
        {
            pos.push(cx);
            pos.push(cy);
            pos.push(z_cor);
        }
        else if(i%3==1)
        {
            pos.push(cx + prevx);
            pos.push(cy + prevy);
            pos.push(z_cor);
        }
        else
        {
            newCor = rotate(prevx, prevy, angle, 0.0, 0.0);
            prevx=newCor[0];
            prevy=newCor[1];
            pos.push(cx + prevx);
            pos.push(cy + prevy);
            pos.push(z_cor);
        }
    }
    return pos;
}

// fill indices in sequence
function fillSeqIndices(n) {
    indices = [];
    for(i=0;i<n;i++)
    {
        indices.push(i);
    }
    return indices;
}

function drawCyl(cx, cy, cz, n, rad1, rad2, ht) {
    let pos = [];
    angle = 2 * Math.PI  / n;
    x1 = cx + rad1;
    y1 = cy;
    x3 = cx + rad2;
    y3 = cy;
    tmp=rotate(x1, y1, angle, cx, cy);
    x2=tmp[0];
    y2=tmp[1];
    tmp = rotate(x3, y3, angle, cx, cy);
    x4 = tmp[0];
    y4 = tmp[1];
    for(i=0;i<n;i++)
    {
        tmp2 = drawRect(x1, y1, cz + ht/2, x2, y2, cz + ht/2, x4, y4, cz - ht/2, x3, y3, cz - ht/2);
        pos = pos.concat(tmp2);
        tmp=rotate(x2,y2,angle,cx,cy);
        x1 = x2;
        y1 = y2;
        x2=tmp[0];
        y2=tmp[1];
        tmp = rotate(x4, y4, angle, cx, cy);
        x3 = x4;
        y3 = y4;
        x4 = tmp[0];
        y4 = tmp[1];
    }
    return pos;
}

function lighting_shader(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  const fsSource = `
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `;

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVevrtexColor and also
	// look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
          textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
          normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
      };
      return programInfo;
}

function shader(gl, flag) {
	const vsSource = `
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	varying highp vec2 vTextureCoord;

	void main(void) {
		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		vTextureCoord = aTextureCoord;
	}
	`;

    // Fragment shader program
    
    let fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
    `;
    if(flag == 1)
    {
        fsSource = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            precision highp float;
            vec4 color = texture2D(uSampler, vTextureCoord);
            float gray = dot(color.rgb,vec3(0.299,0.587,0.114));
            gl_FragColor = vec4(vec3(gray),1.0);
              }
        `;
    }

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVevrtexColor and also
	// look up uniform locations.
	const programInfo = {
	program: shaderProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
		textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
	    },
	uniformLocations: {
		projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
		modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
	    },
    };
return programInfo;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	return null;
	}

	return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
	return null;
	}

	return shader;
}
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                                width, height, border, srcFormat, srcType,
                                pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                                    srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
        } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function createBoundingBox(x, y, z, length, breadth, height) {
    let bx = {};
    bx.x = x;
    bx.y = y;
    bx.z = z;
    bx.length = length;
    bx.breadth = breadth;
    bx.height = height;
    return bx;
}

function detect_collision(a, b) {
	return (Math.abs(a.x - b.x) * 2 <= (a.length + b.length)) &&
		   (Math.abs(a.y - b.y) * 2 <= (a.breadth + b.breadth)) &&
		   (Math.abs(a.z - b.z) * 2 <= (a.height + b.height));
}

