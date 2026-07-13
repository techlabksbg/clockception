import Board from "./board.js";
import KeyFrame from "./keyframe.js";
import { maxv } from "./params.js";

function registerKeyboard(board) {
    function selectNbWatch(dx,dy, e) {
        let i = board.multiselection.lastSelected;
        if (i==-1) {
            board.multiselection.select(0);
            return;
        }
        
        let watch = board.watches[i];
        let x = ((watch.x+dx)%board.w+board.w)%board.w;
        let y = ((watch.y+dy)%board.h+board.h)%board.h;
        if (!e.ctrlKey) {
            board.multiselection.selectNone();
        }
        board.multiselection.select(x+y*board.w);
    }

    function angleKeys(e) {
        if (board.selectedWatch!==null) {
            let angleKeys = {"A":270,"Q":315,"W":0,"E":45,"D":90, "C":135,"X":180, "Z":225, "Y":225};
            for (let k in angleKeys) {
                if (e.code=="Key"+k) {
                    let selection = board.multiselection.getSelection();
                    if (selection.length>0) {
                        for (let watch of selection) {
                            let i=watch.getAttribute('index');
                            board.watches[i].hands[board.selectedHand].setAngle(angleKeys[k]);
                        }
                        board.toggleSelectedHand();
                    }
                    return;
                }
            }
            if (e.code=="KeyS") {
                board.toggleSelectedHand();
                return;
            }
            if (e.code=="KeyR" || e.code=="KeyV") {
                let selection = board.multiselection.getSelection();
                if (selection.length>0) {
                    for (let watch of selection) {
                        let i=watch.getAttribute('index');
                        let h = board.watches[i].hands[board.selectedHand];
                        if (e.code=="KeyR") {
                            h.setAngle(h.angle+15);
                        }
                        if (e.code=="KeyV") {
                            h.setAngle(h.angle-15);
                        }
                    }
                }
                return;
            }
        }
    }
    function digitKeys(e) {
        for (let d=0; d<10; d++) {
            if (e.code == `Digit${d}`) {
                let selection = board.multiselection.getSelection();
                if (selection.length>0) {
                    for (let watch of selection) {
                        let i=watch.getAttribute('index');
                        let h = board.watches[i].hands[board.selectedHand];
                        console.log(`Digit ${d} found at d=${d}, h=${h}`);
                        if (e.shiftKey) {
                            h.setSpeed(-d/10.0*maxv);
                        } else {
                            h.setSpeed(d/10.0*maxv);
                        }
                    }
                }
            }
        }
    }

    document.body.addEventListener('keydown', (e)=>{
        //console.log(e.target.tagName);
        if (e.target.tagName == "INPUT") return;
        if (e.target.tagName == "TEXTAREA") return;
        console.log(e.code);
        
        switch(e.code) {
            case "ArrowRight":
            case "KeyL":
                selectNbWatch(1,0,e);
                break;
            case "ArrowDown":
            case "KeyK":
                selectNbWatch(0,1,e);
                break;
            case "ArrowLeft":
            case "KeyJ":
                selectNbWatch(-1,0,e);
                break;
            case "ArrowUp":
            case "KeyI":
                selectNbWatch(0,-1,e);
                break;
            case "KeyF": {
                let f = new KeyFrame(board);
                board.animation.addKeyFrame(f);
                break;
            }
            case "KeyP":
                if (board.animation.running) {
                    board.animation.pause();
                } else {
                    board.animation.play();
                }
                break;
            case "Period":
                if (board.animation.running) {
                    board.animation.stop();
                }
                break;
            case "Delete":
                board.animation.frameBox.delete();
                break;
            case "Backspace":
                board.stampBox.delete();
                break;
            case "PageUp": {
                let i = board.animation.frameBox.multiselection.lastSelected;
                if (i>=0 && i<board.animation.frameBox.multiselection.n-1) {
                    board.animation.moveKeyFrame(i,i+1);
                }
                break;
            }
            case "PageDown": {
                let i = board.animation.frameBox.multiselection.lastSelected;
                if (i>0) {
                    board.animation.moveKeyFrame(i,i-1);
                }
                break;
            }
            case "KeyN":
                board.multiselection.invert();
                break;
            case "KeyM":
                board.stampBox.add();
                break;
            case "KeyB":
                board.stampBox.apply();
                break;
        
            default:
                angleKeys(e);
                digitKeys(e);
        }

    });  
}


export default registerKeyboard;