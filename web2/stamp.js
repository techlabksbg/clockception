import HandState from "./handstate.js";

class Stamp {
    constructor(board) {
        if (board!==null) {
            this.board = board;
            let selection = this.board.multiselection.getSelection().map((e)=>e.getAttribute('index')).sort((a,b)=>a-b);
            let watches = selection.map((i)=>this.board.watches[i]);
            this.x = watches.map((w)=>w.x);
            this.y = watches.map((w)=>w.y);
            console.log(this.x);
            let minx = Math.min(...this.x);
            let miny = Math.min(...this.y);
            this.hands = watches.map((w)=>w.hands.map((h)=>new HandState(h)));
            this.x = this.x.map((x)=>x-minx);
            this.y = this.y.map((y)=>y-miny);
            this.w = Math.max(...this.x)+1;
            this.h = Math.max(...this.y)+1;
            this.n = this.x.length;
            this.makeSVG();
        }
    }

    serialize() {
        return {x:this.x, y:this.y, w:this.w, h:this.h, hands:this.hands.map((h2)=>h2.map(h=>h.serialize()))};
    }

    static fromSerialization(board, ser) {
        let s = new Stamp(null);
        s.x = ser.x;
        s.y = ser.y;
        s.w = ser.w;
        s.h = ser.h;
        s.hands = ser.hands.map((h2)=>h2.map((h)=>HandState.fromSerialization(h)));
        s.board = board;
        s.n = s.x.length;
        s.makeSVG();
        return s;
    }

    makeSVG() {
        let ns = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", `-1 -1 ${this.w+1} ${this.h+1}`);
        for (let i=0; i<this.n; i++) {
            let x = this.x[i];
            let y = this.y[i];
            let c = document.createElementNS(ns, 'circle');
            c.setAttribute("cx",x);
            c.setAttribute("cy",y);
            c.setAttribute("r",0.49);
            c.style="fill:#ddeeff;stroke:none";
            svg.appendChild(c);
            for (let j=0; j<2; j++) {
                let a = this.hands[i][j].angle;
                let p = document.createElementNS(ns, 'path');
                p.setAttribute("transform", `translate(${x} ${y})  rotate(${a-90})`);
                p.style="stroke-width:0.08;stroke-linejoin:round;stroke:#000000;stroke-linecap:round";
                p.setAttribute('d', `M 0 0 h 0.47`);
                svg.appendChild(p);
            }
        }
        this.svg = svg;
    }

    apply() {
        let top = this.board.multiselection.lastSelected;
        if (top>=0) {
            let w = this.board.watches[top];
            for (let i=0; i<this.n; i++) {
                let x = (w.x+this.x[i])%this.board.w;
                let y = (w.y+this.y[i])%this.board.h;
                let wi = x+y*this.board.w;
                for (let j=0; j<2; j++) {
                    this.board.watches[wi].hands[j].apply(this.hands[i][j]);
                }
            }
            // Advance "cursor"
            this.board.multiselection.selectNone();
            let y = Math.floor(top/this.board.w);
            let x = (top % this.board.w + this.w) % this.board.w;
            this.board.multiselection.select(x+y*this.board.w);
        }
    }

};

export default Stamp;