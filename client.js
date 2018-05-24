// "use strict";
if (typeof window.orientation !== "undefined") {
    alert(
        "It looks like you're on mobile. For the best experience, use a computer to play this game."
    );
}
// for soft stroking
// Source: https://stackoverflow.com/a/13542669/5513988
function shadeColor(color, percent) {
    let f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round(
        (t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(
        1);
}
const softStroke = true;

let inGame = false;
let showServerSelector = false;
let showAdvancedConnectionOptions = false;

let scoreboardData = [];

const uiColors = [
    "#6cf1ec", // movement speed
    "#98f06b", // reload
    "#f06c6c", // bullet damage
    "#f0d96c", // bullet penetration
    "#6c96f0", // bullet speed
    "#b894fa", // body damage
    "#ec6bf1", // max health
    "#eeb790", // health regen
];

const teamColors = {
    // FFA psuedoteams
    "enemy": "#F14E54",
    "self": "#1DB2DF",

    // TDM teams
    "red": "#F14E54",
    "blue": "#1DB2DF",

    // Extended set for 4-teamed TDM
    "purple": "#BE83F2",
    "green": "#24DF73",
};

let hitRegions = [];

const bgImage = new Image();
bgImage.src = "https://diep.io/title.png";

const date = new Date();

const hatImage = new Image();
hatImage.src = "http://www.officialpsds.com/images/thumbs/Santa-Hat-psd89867.png";

// Prevent scrolling
window.addEventListener("scroll", function(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
});

// Disable Chrome two-finger swipe to go back/forward
// Source: https://stackoverflow.com/a/46439501/5513988
document.addEventListener("touchstart", this.handleTouchStart, {
    passive: false,
});
document.addEventListener("touchmove", this.handleTouchMove, {
    passive: false,
});

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function defaults(thing, efault) {
    return thing === undefined || thing === null ? efault : thing;
}

function param(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" +
        "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(
        /\+/g, "%20")) || null;
}

const connectIP = defaults(param("ip"), "http://localhost:8080");

let socket = io.connect(connectIP, {
    reconnect: false,
});

let tanktree = {};
socket.on("tanks_update", function(data) {
    tanktree = data;
});

socket.on("disconnect", function(err) {
    addStatusMessage({
        message: "Disconnected from server",
        color: "red",
    });

    socket = function() {
        return io.connect(connectIP, {
            reconnect: false,
        });
    };
});

let width = window.innerWidth;
let height = window.innerHeight;

const input = document.getElementById("textInput");

let spin_angle = 0;

window.addEventListener("load", function() {
    input.value = localStorage.getItem("username") || "";

    canvas.style.display = "initial";
    document.getElementById("loading").style.display = "none";
});

socket.on("signInResponse", function(data) {
    if (data.success) {
        inGame = true;
        showServerSelector = false;
        showAdvancedConnectionOptions = false;
    } else {
        alert("Unable to join. Please try again later.");
    }
});

// game
const sorted = [];
const changed_indexes = [];
const original_indexes = [];
let points = [];
let nicknames = [];
let selfId = null;
const sortedScores = {};

const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.lineJoin = "round";
// init

Shape.list = {};
class Player {
    constructor(initPack) {
        this.id = initPack.id;
        this.number = initPack.number;
        this.x = initPack.x;
        this.y = initPack.y;
        this.tank = defaults(initPack.tank, "basic");
        this.hp = initPack.hp,
            this.hpMax = initPack.hpMax,
            this.score = defaults(initPack.score, 0),
            this.level = defaults(initPack.level, 0),
            this.tier = defaults(initPack.tier, 0),
            this.name = defaults(initPack.name, ""),
            this.mouseAngle = initPack.mouseAngle;
        this.invisible = initPack.invisible;
        this.team = initPack.team;
        this.autospin = initPack.autospin;
        this.angle = defaults(this.mouseAngle, 0);

        Player.list[this.id] = this;
    }

    draw() {
        if (isPlayer) {
            this.angle = angle;
        } else {
            this.angle = this.mouseAngle;
        }
        const x = this.x - Player.list[selfId].x + width / 2;
        const y = this.y - Player.list[selfId].y + height / 2;
        ctx.fillStyle = "black";
        const hpWidth = 30 * this.hp / this.hpMax;
        ctx.font = "30px Ubuntu";
        if (!this.invisible) {
            const size = 25;

            drawTank({
                x: x,
                y: y,
                angle: this.angle,
                radius: 24 + (this.level / 3),
                bodyColor: this.color(),
                barrels: tanktree[this.tank].barrels,
                bodyType: tanktree[this.tank].body,
                showHatSecret: true,
            });
            drawBar({
                x: x + size,
                y: (y + size) + 15,
                filled: this.hp / this.hpMax,
                width: 38,
                height: 7,
                renderOnFull: false,
            });

            // DRAW NAMES
            if (this.id !== selfId) {
                drawText({
                    text: this.name,
                    x: x + (size / 2),
                    y: y - size + 16,
                    font: "17px Ubuntu",
                });
            }
        }
    }

    color() {
        if (this.team === "none") {
            return this.id === selfId ? "#1DB2DF" : "#F14E54";
        } else {
            return teamColors[this.team];
        }
    }
}

let angle = 0;
let angle_pure = 0;
let mouseX;
let mouseY;

document.addEventListener("mousemove", function(event) {
    if (!selfId || Player.list[selfId].autospin) return;

    const x = -width + event.pageX - 8;
    const y = -height + event.pageY - 8;

    const boxCenter = [width / 2, height / 2];

    angle = Math.atan2(event.pageX - boxCenter[0], -(event.pageY - boxCenter[1])) * (
        180 / Math.PI) - 90;
    angle_pure = Math.atan2(event.pageX - boxCenter[0], -(event.pageY - boxCenter[1]) *
        (180 / Math.PI));

    if (Player.list[selfId].autospin) {
        const mgpower = setInterval(function() {
            if (!Player.list[selfId].autospin) {
                clearInterval(mgpower);
            }
            angle++;
        });
    }

    socket.emit("keyPress", {
        inputId: "mouseAngle",
        state: angle,
    });
});

Player.list = {};

class Bullet {
    constructor(initPack) {
        this.id = initPack.id;
        this.pid = initPack.parent_id;
        this.x = initPack.x;
        this.y = initPack.y;
        if (Player.list[this.pid]) {
            this.parent_tank = Player.list[this.pid].tank;
        }
        this.type = initPack.type;
        this.color = this.parent_tank.color();
        this.barrels = initPack.barrels;
        this.angle = initPack.angle;

        Bullet.list[this.id] = this;
    }

    draw() {
        const x = this.x - Player.list[selfId].x + width / 2;
        const y = this.y - Player.list[selfId].y + height / 2;

        ctx.fillStyle = this.color;
        switch (this.parent_tank) {
            case "destroyer":
            case "destroyerflank":
            case "Hybrid":
                drawCircle(x, y, 20, this.color, this.type);
                break;
            case "Arena Closer":
                drawCircle(x, y, 19, self.color, this.type);
                break;
            case "streamliner":
                drawCircle(x, y, 8, self.color, this.type);
                break;
            default:
                drawTank({
                    "x": x,
                    "y": y,
                    "angle": this.angle,
                    "radius": 10,
                    "bodyColor": this.color,
                    "barrels": this.barrels,
                    "bodyType": 0
                });
        }
    }
}

Bullet.list = {};
socket.on("init", function(data) {
    if (data.selfId) {
        selfId = data.selfId;
    }

    for (const item of data.player) {
        new Player(item);
    }
    for (const item of data.bullet) {
        new Bullet(item);
    }
    for (const item of data.shape) {
        new Shape(item);
    }
});
socket.on("update", function(data) {
            points = [];
            nicknames = [];
            data.player.forEach((player, i) => {
                    const player_id = data.player[i].id;
                    const pack = data.player[i];
                    const p = Player.list[pack.id];
                    points.push(data.player[i].score + "." + player_id);
                    if (p) {
                        if (pack.tank) {
                            p.tank = pack.tank;
                        }
                        if (pack.mouseAngle !== undefined) {
                            p.mouseAngle = pack.mouseAngle;
                        }
                        if (pack.x !== undefined) p.x = pack.x;
                        if (pack.y !== undefined) p.y = pack.y;
                        if (pack.hp !== undefined) p.hp = pack.hp;
                        if (pack.score !== undefined) p.score = pack.score;
                        p.level = pack.level;
                        p.tier = pack.tier;
                    }
                    if (data.player[i].id == selfId) {
                        const pack = data.shape[data.player[i].id];
                        for (let i = 0; i < pack.length; i++) {
                            const s = Shape.list[pack[i].id];
                            if (s) {
                                if (pack[i].x !== undefined) s.x = pack[i].x;
                                if (pack[i].y !== undefined) s.y = pack[i].y;
                            }
                        }
                    }
                }
                data.bullet.forEach(bullet => {
                    const b = Bullet.list[bullet.id];
                    if (b) {
                        if (bullet.x !== undefined) b.x = bullet.x;
                        if (bullet.y !== undefined) b.y = bullet.y;
                    }
                });
            });

        socket.on("scoreboard", (data) => {
            scoreboardData = data;
        });

        const statusMessages = [];

        socket.on("statusMessage", addStatusMessage);

        // remove
        socket.on("remove", function(data) {
            for (let i = 0; i < data.player.length; i++) {
                delete Player.list[data.player[i]];
            }
            for (let i = 0; i < data.bullet.length; i++) {
                delete Bullet.list[data.bullet[i]];
            }
            for (let i = 0; i < data.shape.length; i++) {
                delete Shape.list[data.shape[i]];
            }
        });
        // drawing
        let pastx;
        let pasty;

        function loopy() {
            canvas.width = width = window.innerWidth;
            canvas.height = height = window.innerHeight;

            hitRegions = [];

            if (inGame) {
                if (Player.list[selfId]) {
                    textInput.style.display = "none";
                }
                spin_angle = spin_angle < 360 ? spin_angle + 0.25 : 0;

                if (!selfId) return;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = "#b9b9b9";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawGrid(width / 2 - Player.list[selfId].x, height / 2 - Player.list[
                    selfId].y, 1500, 1500, 24, "#cdcdcd", "#C6C6C6", 0, 0);
                pastx = Player.list[selfId].x;
                pasty = Player.list[selfId].y;
                for (const i in Shape.list) {
                    Shape.list[i].draw();
                }
                for (const i in Bullet.list) {
                    Bullet.list[i].draw();
                }
                Player.list.forEach((pla, i) => {
                    if (Player.list[i].id == selfId) {
                        Player.list[i].draw(angle, true);
                    } else {
                        Player.list[i].draw(angle, false);
                    }
                });

                // DRAW USER INTERFACE
                drawPlayerCount();
                drawScoreboard();
                // minimap would render here
                drawHotbar();
                drawStatusMessages();
                drawUpgrades();
            } else {
                // TITLE SCREEN IMAGE
                const canvasRatio = canvas.width / canvas.height;
                const bgImageRatio = bgImage.width / bgImage.height;
                if (canvasRatio > bgImageRatio) {
                    ctx.drawImage(bgImage, 0, canvas.height / 2 - canvas.width /
                        bgImageRatio / 2, canvas.width, canvas.width / bgImageRatio);
                } else {
                    ctx.drawImage(bgImage, canvas.width / 2 - canvas.height *
                        bgImageRatio / 2, 0, canvas.height * bgImageRatio, canvas.height);
                }
                // DARKEN THE IMAGE
                /* ctx.fillColor = 'black';
                ctx.globalAlpha = 0.03;

                ctx.fillRect(0, 0, canvas.width, canvas.height);*/
                drawText({
                    text: "This is the tale of...",
                    x: canvas.width / 2,
                    y: (canvas.height / 2) - 28,
                    font: "bold 18px Ubuntu",
                });
                ctx.fillStyle = "white";
                ctx.fillRect((canvas.width / 2) - 160, (canvas.height / 2) - 20, 320,
                    40);
                ctx.fillStyle = "black";
                ctx.strokeRect((canvas.width / 2) - 160, (canvas.height / 2) - 20, 320,
                    40);
                input.style.left = (canvas.width / 2) -
                    160 + "px";
                input.style.top = (canvas.height / 2) -
                    20 + "px";
                drawText({
                    text: "(press enter to spawn)",
                    x: canvas.width / 2,
                    y: (canvas.height / 2) + 32,
                    font: "bold 10px Ubuntu",
                });

                drawClickArea({
                    x: canvas.width / 2 - 55,
                    y: 15,
                    width: 120,
                    height: 25,
                    color: "#b0b0b0",
                    strokeWidth: 4.5,
                    tankData: "Server Finder",
                });

                hitRegions.push({
                    x: canvas.width / 2 - 55,
                    y: 15,
                    width: 120,
                    height: 25,
                    activate: function() {
                        if (!inGame) {
                            showServerSelector = !showServerSelector;
                        }
                    },
                });

                if (showServerSelector || showAdvancedConnectionOptions) {
                    drawServerSelectorUI();
                    textInput.style.display = "none";
                } else {
                    // SHOW TEXT INPUT
                    textInput.style.display = "initial";
                }

                drawStatusMessages();
            }

            // We loopy again.
            window.requestAnimationFrame(loopy);
        }

        // Let's start to loopy.
        window.requestAnimationFrame(loopy);

        document.addEventListener("keydown", inputHandler); document.addEventListener("keyup", inputHandler);

        function inputHandler(event, isHeld = event.type === "keydown") {
            if (document.activeElement == input && event.keyCode == 13) {
                tryJoin();
            }

            if (isHeld) {
                if (event.code == "KeyE") {
                    socket.emit("keyPress", {
                        inputId: "auto",
                        state: true,
                    });

                    addStatusMessage({
                        message: "Auto Fire toggled",
                        color: "indigo",
                    });
                }
                if (event.keyCode == "KeyC") {
                    socket.emit("keyPress", {
                        inputId: "spin",
                        state: true,
                    });

                    addStatusMessage({
                        message: "Auto Spin toggled",
                        color: "indigo",
                    });
                }
            }

            switch (event.keyCode) {
                case 68:
                case 39:
                    socket.emit("keyPress", {
                        inputId: "right",
                        state: isHeld,
                    });
                    break;
                case 83:
                case 40:
                    socket.emit("keyPress", {
                        inputId: "down",
                        state: isHeld,
                    });
                    break;
                case 65:
                case 37:
                    socket.emit("keyPress", {
                        inputId: "left",
                        state: isHeld,
                    });
                    break;
                case 87:
                case 38:
                    socket.emit("keyPress", {
                        inputId: "up",
                        state: isHeld,
                    });
                    break;
                case 32:
                    socket.emit("keyPress", {
                        inputId: "attack",
                        state: isHeld,
                    });
                    break;
                case 16:
                    socket.emit("keyPress", {
                        inputId: "repel",
                        state: isHeld,
                    });
                    break;
                case 123: // f11
                    if (!document.fullscreenElement && isHeld) {
                        canvas.webkitRequestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                    break;
            }
        }

        input.addEventListener("click", function(event) {
            if (event.detail >= 3) {
                addStatusMessage({
                    message: "Control change mode activated",
                    color: "indigo",
                });
            }
        });

        document.addEventListener("mousedown", function(event) {
            if (inGame) {
                socket.emit("keyPress", {
                    inputId: event.button == 0 ? "attack" : "repel",
                    state: true,
                });
            }

            for (let pos = 0; pos < hitRegions.length; pos++) {
                let pastMinX = event.clientX >= hitRegions[pos].x,
                    pastMinY = event.clientY >= hitRegions[pos].y,
                    beforeMaxX = event.clientX <= hitRegions[pos].x + hitRegions[pos].width,
                    beforeMaxY = event.clientY <= hitRegions[pos].y + hitRegions[pos].height;

                if (pastMinX && pastMinY && beforeMaxX && beforeMaxY) {
                    hitRegions[pos].activate(pos);
                }
            }
        });

        document.addEventListener("mouseup", (event) => {
            socket.emit("keyPress", {
                inputId: event.button == 0 ? "attack" : "repel",
                state: false,
            });
        });
