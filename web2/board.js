import Animation from "./animation.js";
import registerKeyboard from "./keyboard.js";
import MultiSelection from "./multiselection.js";
import { boardHeight, boardWidth, maxv } from "./params.js";
import StampBox from "./stampbox.js";
import Watch from "./watch.js";

class Board {
    constructor() {
        this.w = boardWidth;
        this.h = boardHeight;
        this.div = document.getElementById('board');
        this.watches = [];
        for (let y=0; y<this.h; y++) {
            for (let x=0; x<this.w; x++) {
                this.watches.push(new Watch(this, x, y, x+y*this.w));
            }
        }
        //this.selectedWatch = null;
        this.selectedHand = 0;
        registerKeyboard(this);
        this.animation = new Animation(this);
        this.stampBox = new StampBox(this);
        this.stampBox.load();
        this.multiselection = new MultiSelection({elements:this.div.querySelectorAll("div.watch"), className:"watchselected", 
            shiftSelection:(low,high,j)=>{
                let xlh = [low%this.w, high%this.w].sort((a,b)=>a-b);
                let ylh = [Math.floor(low/this.w), Math.floor(high/this.w)];
                let x = j%this.w;
                let y = Math.floor(j/this.w);
                return xlh[0]<=x && x<=xlh[1] && ylh[0]<=y && y<=ylh[1];
            },
            selectionCallback:(i,selected=true)=>{
                for (let j=0; j<2; j++) {
                    if (selected && j==this.selectedHand) {
                        this.watches[i].hands[j].div.classList.add("handselected");
                    } else {
                        this.watches[i].hands[j].div.classList.remove("handselected");
                    }
                }
            }
        });
        this.installCodeHandler();
    }

    installCodeHandler() {
        let angleCode = document.getElementById('anglecode');
        angleCode.addEventListener('keyup',(e)=>{
            if (e.keyCode==13) {
                document.getElementById('anglecodebutton').click();
            }
        });
        document.getElementById('anglecodebutton').addEventListener('click', ()=>{
            try {
                let anglefn = eval(`(x,y,i)=>${angleCode.value}`);
                for (let y=0; y<this.h; y++) {
                    for (let x=0; x<this.w; x++) {
                        for (let i=0; i<2; i++) {
                            this.watches[x+y*this.w].hands[i].setAngle(anglefn(x,y,i));
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });

        let speedCode = document.getElementById('speedcode');
        speedCode.addEventListener('keyup',(e)=>{
            if (e.keyCode==13) {
                document.getElementById('speedcodebutton').click();
            }
        });
        document.getElementById('speedcodebutton').addEventListener('click', ()=>{
            try {
                let speedfn = eval(`(x,y,i)=>${speedCode.value}`);
                for (let y=0; y<this.h; y++) {
                    for (let x=0; x<this.w; x++) {
                        for (let i=0; i<2; i++) {
                            let s = speedfn(x,y,i);
                            if (s>1) s=1;
                            if (s<-1) s=-1;
                            s *= maxv;
                            this.watches[x+y*this.w].hands[i].setSpeed(s);
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    toggleSelectedHand() {
        for (let w of this.multiselection.getSelection()) {
            let i = Number(w.getAttribute('index'));
            for (let j=0; j<2; j++) {
                if (j==this.selectedHand) {
                    this.watches[i].hands[j].div.classList.remove("handselected");
                } else {
                    this.watches[i].hands[j].div.classList.add("handselected");
                }
            }
        }
        this.selectedHand = 1-this.selectedHand;
    }

    // indices of watch and hand
    selectHand(w,i) {
        throw "deprecated"
        for (let watch of this.watches) {
            for (let hand of watch.hands) {
                hand.div.classList.remove("handselected");
            }
        }
        if (i>=0) {
            this.watches[w].hands[i].div.classList.add("handselected");
        }
    }

    selectWatch(w) {
        console.log(w);
        let select = (w)=> {
            this.selectedWatch = w;
            w.div.classList.add("selected");
            w.hands[this.selectedHand].div.classList.add("selected");
            w.hands[1-this.selectedHand].div.classList.remove("selected");
        };
        let unselect = (w)=> {
            w.div.classList.remove("selected");
            w.hands[0].div.classList.remove("selected");
            w.hands[1].div.classList.remove("selected");
            this.selectedWatch = null;
        };

        if (this.selectedWatch===null) {
            select(w);
            return;
        }
        if (this.selectedWatch===w) {
            unselect(w);
            return;
        }
        unselect(this.selectedWatch);
        select(w);
    }
};

export default Board;