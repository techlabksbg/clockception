import Cubic from "./cubic.js";
import FramesBox from "./framesbox.js";
import KeyFrame from "./keyframe.js";

class Animation {
    constructor(board) {
        this.board = board;
        this.keyframes = [];
        this.running = false;
        this.baked = false;
        this.ended = false;
        this.cubics = [];
        this.t1 = [];
        this.tzero = 0;
        this.tstop = 0;
        this.cubeIndex = 0;
        this.frameBox = new FramesBox(this);
    }

    addKeyFrame(kf) {
        this.baked = false;
        this.keyframes.push(kf);
        this.frameBox.addFrame(kf);
    }

    // Called from framebox
    deleteKeyFrame(i) {
        this.baked = false;
        this.keyframes.splice(i,1);
    }

    moveKeyFrame(i,j) {
        this.baked = false;
        let [kfi] = this.keyframes.splice(i,1);
        this.keyframes.splice(j,0,kfi);
        this.frameBox.moveKeyFrame(i,j);
    }

    // Computes suitable transitions
    bake() {
        this.cubics = [];
        this.t1 = [];
        let kf0 = new KeyFrame(this.board);
        for (let k of this.keyframes) {
            let [c,t1] = k.getTimedCubics(kf0);
            this.cubics.push(c);
            this.t1.push(t1);
            kf0 = k;
        }
        this.baked = true;
    }



    play() {
        if (!this.running) {
            if (this.ended) {
                this.ended = false;
                this.tstop = 0;
                this.tzero = 0;
                this.cubeIndex = 0;
                this.baked = false;
            }
            if (!this.baked) {
                this.bake();
            }
            this.running = true;
            let now = Date.now();
            this.tzero += (now-this.tstop);
            requestAnimationFrame(()=>this.step());
        }
    }
    pause() {
        if (this.running) {
            this.tstop = Date.now();
            this.running = false;
        }
    }
    stop() {
        this.running = false;
        this.ended = false;
        this.tstop = 0;
        this.tzero = 0;
        this.cubeIndex = 0;
        this.baked = false;
    }

    step() {
        if (!this.running) return;
        let n = Date.now();
        let t = n-this.tzero;
        console.log(t);
        if (t>this.t1[this.cubeIndex]) {
            if (this.cubeIndex<this.cubics.length-1) {
                this.tzero = n;
                t = 0;
                this.cubeIndex++;
            } else {
                this.ended = true;
            }
        }
        for (let i=0; i<this.cubics[this.cubeIndex].length; i++) {
            for (let j=0; j<2; j++) {
                this.board.watches[i].hands[j].setAngle(this.cubics[this.cubeIndex][i][j].angle(t));
                this.board.watches[i].hands[j].setSpeed(this.cubics[this.cubeIndex][i][j].v(t));
            }
        }
        if (this.running) {
            requestAnimationFrame(()=>this.step());
        }
    }


};

export default Animation;