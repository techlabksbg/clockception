import Hand from "./hand.js";

class Watch {
    constructor(b, x, y, i) {
        this.board = b;
        this.x = x;
        this.y = y;
        this.i = i;
        this.makeDiv();        
        this.hands = Array.from({length:2},()=>new Hand(this));
        this.board.div.appendChild(this.div);
    }

    makeDiv() {
        let w = document.createElement('div');
        //w.addEventListener('click',()=>this.board.selectWatch(this));
        w.setAttribute('index',this.i);
        w.className = "watch";
        this.div = w;
    }
};

export default Watch;