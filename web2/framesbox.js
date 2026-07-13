import MultiSelection from "./multiselection.js";


class FramesBox {
    constructor(animation) {
        this.animation = animation;
        this.board = animation.board;
        this.multiselection = new MultiSelection({elements:[], className:"frameselected",
            clickCallback:(i)=>{
               this.animation.keyframes[i].apply(); 
               document.getElementById("t2input").value = this.animation.keyframes[i].t2/1000;
            }
        });
        document.getElementById("t2input").addEventListener('change',()=>{
            let sel = this.multiselection.lastSelected;
            if (sel>=0) {
                this.animation.keyframes[sel].t2 = Number(document.getElementById("t2input").value)*1000;
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