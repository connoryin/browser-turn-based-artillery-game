import React, {useState, useEffect, useRef} from 'react';
import Tank from './Tank';
import Projectile from './Projectile';
import Wind from './Wind';
import io from "socket.io-client";
import Button from 'react-bootstrap/Button';

const Game = () => {
    const fieldWidth = 2000;
    const fieldHeight = 1000;
    const groundHeight = 50;

    const [turn, setTurn] = useState(0);
    const [angle, setAngle] = useState(45);
    const [velocity, setVelocity] = useState(50);
    const [projectile, setProjectile] = useState(null);
    const tanks = [new Tank({x: 500, y: 75}, 'lightgreen'), new Tank({x: 1500, y: 75}, 'lightblue')];
    const [wind, setWind] = useState(new Wind(null, null));
    let [distance, setDistance] = useState(null);
    let [gameOver, setGameOver] = useState(0);
    let [myTurn, setMyTurn] = useState(0);
    let [gameId, setGameId] = useState(0);
    const [socket, setSocket] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const newSocket = io("http://localhost:3001");
        setSocket(newSocket);
        let playerId = localStorage.getItem('playerId');

        newSocket.on("connect", () => {
            console.log("Connected to server");
            if (!playerId) playerId = newSocket.id;
            newSocket.emit('joinGame', playerId);
            localStorage.setItem('playerId', playerId);
        });

        newSocket.on('disconnect', function () {
            console.log('disconnected from server');
        });

        newSocket.on('reconnect', function () {
            console.log('reconnected to server');
            if (playerId) {
                socket.emit('joinGame', playerId);
            }
        });

        newSocket.on('gameState', (state) => {
            console.log(state)
            console.log('myturn:', state['num'])
            setMyTurn(state['num'])
            setGameOver(state['isGameOver'])
            setWind(new Wind(state['windMagnitude'], state['windDirection']))
            setGameId(state['gameId'])
            setTurn(state['turn'])
        });

        newSocket.on('updateProjectile', (state) => {
            console.log('myturn:', state['turn'])
            const tank = tanks[state['turn']];
            const position = {x: tank.position.x, y: tank.position.y + 25};
            const newProjectile = new Projectile(position, state['ang'], state['velocity']);
            setProjectile(newProjectile);
            setDistance(null);
        })

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, []);

    const handleFire = (other = false) => {
        const tank = tanks[myTurn];
        const position = {x: tank.position.x, y: tank.position.y + 25};
        const ang = turn === 0 ? angle : 180 - angle;
        const newProjectile = new Projectile(position, ang, velocity);
        setProjectile(newProjectile);
        setDistance(null);
        socket.emit("fire", {"gameId": gameId, "ang": ang, "velocity": velocity, "myTurn": myTurn});
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        let requestAnimationFrameId;
        let previousTime = null;
        let count = 0;
        const draw = (currentTime) => {
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the sky
            context.fillStyle = 'white';
            context.fillRect(0, 0, fieldWidth, canvas.height - groundHeight);

            // Draw the ground
            context.fillStyle = 'grey';
            context.fillRect(0, canvas.height - groundHeight, fieldWidth, groundHeight);

            // Draw the tanks
            tanks.forEach(tank => {
                context.fillStyle = tank.color;
                context.beginPath();
                context.arc(tank.position.x, canvas.height - tank.position.y, 20, 0, 2 * Math.PI);
                context.fill();
            });

            // Draw the projectile
            if (projectile !== null) {
                context.fillStyle = 'black';
                context.beginPath();
                context.arc(projectile.position.x, canvas.height - projectile.position.y, 5, 0, 2 * Math.PI);
                context.fill();

                if (previousTime != null) {
                    const dt = (currentTime - previousTime) / 1000;
                    count += dt;
                    projectile.update(dt, wind);
                }

                // when projectile goes off the window or hit th ground
                if (!projectile.isOnField(fieldWidth, fieldHeight, groundHeight)) {
                    if (projectile.position.y <= groundHeight) {
                        console.log('time used: ', count);
                        for (let tank of tanks) {
                            const opponentPosition = tank.position;
                            if (projectile.checkForHit(opponentPosition)) {
                                setGameOver(tanks.indexOf(tank) + 1);
                                console.log('game over');
                                socket.emit('over', {'gameId': gameId, 'loser': tanks.indexOf(tank) + 1})
                                localStorage.clear()
                                break
                            }
                        }

                        // Calculate distance to opponent's tank
                        distance = Math.abs(projectile.position.x - tanks[1 - turn].position.x);
                        setDistance(distance.toFixed(2));
                    }
                    console.log('clear projectile')
                    setProjectile(null);
                    setTurn(turn === 0 ? 1 : 0);
                }
            }

            // Request another animation frame
            previousTime = currentTime;
            requestAnimationFrameId = requestAnimationFrame(draw);
        };

        // Start the animation loop
        draw();

        // Return a cleanup function to stop the animation loop when the component unmounts
        return () => {
            cancelAnimationFrame(requestAnimationFrameId);
        };
    }, [tanks, projectile, gameOver, myTurn]);


    return (
        <div>
            <div style={{
                position: 'absolute',
                top: 30,
                left: '50%',
                transform: 'translateX(-30%)',
                textAlign: 'center',
                width: '100%',
                fontSize: '40px'
            }}>
                {distance !== null && (
                    <div>
                        Projectile distance to tank{turn + 1}: {distance} meters
                    </div>
                )}
            </div>
            <div style={{position: 'absolute', top: 30, left: 10, textAlign: 'left', fontSize: '40px'}}>
                Wind: {Math.abs(wind.x).toFixed(2)} m/s {wind.direction < 0 ? 'to the left' : 'to the right'}
            </div>
            {gameOver && (
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    width: '100%',
                    fontSize: '72px',
                    fontWeight: 'bold'
                }}>
                    <div>
                        Player {3 - gameOver}: You win!
                    </div>
                    <div>
                        Player {gameOver}: You lose!
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} width="2000" height="1000"  style={{ border: '1px solid black' }}/>
            <div style={{display: 'flex', gap: '20px', marginTop: '10px'}}>
                <label>
                    <h1>Velocity:</h1>
                    <input type="text" value={velocity} onChange={e => setVelocity(Number(e.target.value))} style={{
                        textAlign: 'center',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        fontSize: '40px',
                        fontWeight: 'bold'
                    }}/>
                </label>
                <label>
                    <h1>Angle:</h1>
                    <input type="range" min="0" max="90" step="1" value={angle}
                           onChange={e => setAngle(Number(e.target.value))} style={{
                               width: '500px'
                    }}/>
                    <span><h1>{angle} degrees</h1></span>
                </label>
                <Button variant="danger" onClick={handleFire}
                        disabled={gameOver || turn !== myTurn}><h1>Fire!</h1></Button>

            </div>

        </div>
    );
};

export default Game;
