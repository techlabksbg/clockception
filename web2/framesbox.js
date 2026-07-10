import MultiSelection from "./multiselection.js";


class FramesBox {
    constructor(animation) {
        this.animation = animation;
        this.board = animation.board;
        this.multiselection = new MultiSelection({elements:[], className:"frameselected",
            clickCallback:(i)=>{
               this.animation.keyframes[i].apply(); 
            }
        });
    }

    addFrame(kf) {
        let d = document.createElement('div');
        d.appendChild(kf.svg);
        document.getElementById('frames').appendChild(d);
        this.multiselection.addElement(d);
    }
    
    delete() {
        let sel = this.multiselection.getSelection().map((e)=>e.getAttribute('multiselectindex')).sort((a,b)=>b-a);
        console.log(sel);
        for(let i of sel) {
            let d = this.multiselection.delete(i);
            this.animation.deleteKeyFrame(i);
            d.remove();
        }
    }

    moveKeyFrame(i,j) {
        this.multiselection.move(i,j);
    }

}

export default FramesBox;