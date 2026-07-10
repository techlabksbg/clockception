import {maxv} from "./params.js"

class Hand {
    constructor(w) {
        this.watch = w;
        this.angle = 0;
        this.v = 0;
        this.div = document.createElement("div");
        this.div.className = "hand";
        this.watch.div.appendChild(this.div);
    }
    
    setAngle(a) {
        this.angle = a;
        this.setStyle();
    }

    setSpeed(v) {
        this.v = v;
        this.setStyle();
    }

    apply(handstate) {
        this.setAngle(handstate.angle);
        this.setSpeed(handstate.v);
    }

    setStyle() {
        let vrel = this.v/maxv;
        this.div.style="";
        this.div.style.transform = `rotate(${this.angle}deg)`;
        if (vrel>0) {
            this.div.style.backgroundImage = `linear-gradient(to right, rgb(0,0,0), hsl(${120*(1-vrel)},100%, ${Math.floor(Math.pow(vrel,0.2)*50)}%)`;
            this.div.style.border = "none";
        } else if (vrel<0) {
            this.div.style.backgroundImage = `linear-gradient(to left, black, hsl(${120*(1+vrel)},100%, ${Math.floor(Math.pow(-vrel,0.2)*50)}%)`;
            this.div.style.border = "0";
        } else {
            this.div.style.backgroundColor = "black";
        }
    }

};

export default Hand;