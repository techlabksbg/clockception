import Cubic from "./cubic.js";
import HandState from "./handstate.js";
import { maxv, maxa } from "./params.js";


class KeyFrame {
    constructor(board) {
        this.board = board;
        this.states = [];        
        for (let w of board.watches) {
            let s = [];
            for (let i=0; i<2; i++) {
                s.push(new HandState(w.hands[i]));
            }
            this.states.push(s);
        }
        this.makeSVG();
    }

    makeSVG() {
        let ns = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", `-1 -1 ${this.board.w+1} ${this.board.h+1}`);
        for (let i=0; i<this.states.length; i++) {
            let x = this.board.watches[i].x;
            let y = this.board.watches[i].y;
            for (let j=0; j<2; j++) {
                let a = this.states[i][j].angle;
                let p = document.createElementNS(ns, 'path');
                p.setAttribute("transform", `translate(${x} ${y})  rotate(${a-90})`);
                p.style="stroke-width:0.05;stroke-linejoin:round;stroke:#000000;stroke-linecap:round";
                p.setAttribute('d', `M 0 0 h 0.47`);
                svg.appendChild(p);
            }
        }
        this.svg = svg;
    }

    apply() {
        for (let i=0; i<this.states.length; i++) {
            for (let j=0; j<2; j++) {
                this.board.watches[i].hands[j].setAngle(this.states[i][j].angle);
                this.board.watches[i].hands[j].setSpeed(this.states[i][j].v);
            }
        }
    }

    getFastestCubics(kf0, optimizeAngles=true) {
        let cubics=[];
        let totalmax = 0;
        for (let i=0; i<this.states.length; i++) {
            let tmaxorder = 1000000;
            let corder = [];
            for (let order=0; order<2; order++) {
                let tmax = 0;
                let c = [];
                for (let j=0; j<2; j++) {
                    let source = kf0.states[i][j];
                    let target = this.states[i][order == 0 ? j: 1-j].clone();
                    if (optimizeAngles) {
                        source.angle = ((source.angle % 360)+360)%360;
                        target.angle = ((target.angle % 360)+360)%360;
                        if (Math.abs(target.angle - source.angle)>180) {
                            if (target.angle > source.angle) {
                                target.angle-=360;
                            } else {
                                target.angle+=360;
                            }
                        } else if (Math.abs(target.angle - source.angle)<1) {
                            if (j==0) {
                                target.angle += 360;
                            } else {
                                target.angle -= 360;
                            }
                        }
                    }
                    let cc = this.getFastestCubic(source, target);
                    tmax = Math.max(tmax, cc.t1);
                    c.push(cc);
                }
                if (tmax<tmaxorder) {
                    tmaxorder = tmax;
                    corder = c;
                }
            }
            totalmax = Math.max(totalmax, tmaxorder);
            cubics.push(corder);
        }
        return [cubics, totalmax];
    }           

    getTimedCubics(kf0) {
        let [cubics,tmax] = this.getFastestCubics(kf0);
        for (let ccs of cubics) {
            for (let c of ccs) {
                c.retime(tmax);
            }
        }
        return [cubics, tmax];
    }

    getFastestCubic(h0, h1) {
        let tmin = 100; // 0.1s
        let tmax = 100000; // 100s
        let tmid;
        let c;
        for (let i=0; i<30; i++) {
            tmid = (tmin+tmax)/2;
            c = new Cubic(h0, h1, tmid);
            if (c.maxv()<maxv && c.maxa()<maxa) {
                tmax = tmid;
            } else {
                tmin = tmid;
            }
        }
        return c;
    }
}

export default KeyFrame;