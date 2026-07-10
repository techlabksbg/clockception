import MultiSelection from "./multiselection.js";
import { defaultStamps } from "./params.js";
import Stamp from "./stamp.js";


class StampBox {
    constructor(board) {
        this.board = board;
        this.stamps = [];
        this.div = document.getElementById('stamps');
        this.multiselection = new MultiSelection({elements:[],
            className:"stampselected",
            clickCallback:(i)=>{
                this.stamps[i].apply();
            }
        });
        document.querySelector("#stampsToClipboard").addEventListener('click',()=>{
            let ser = JSON.stringify({stamps:this.stamps.map((s)=>s.serialize())});
            navigator.clipboard.write(ser).then(()=>{
                console.log("copied!");
            },()=>{
                console.log("coping failed!");
                document.querySelector("#stamptext textarea").innerText = ser;
            });

        });
    }

    apply() {
        let s = this.multiselection.lastSelected;
        if (s>=0) {
            this.stamps[s].apply();
        }
    }

    add(s = null) {
        if (s==null) {
            s = new Stamp(this.board);
        }
        if (s.n>0) {
            this.stamps.push(s);
            let d=document.createElement('div');
            d.appendChild(s.svg);
            this.div.appendChild(d);
            this.multiselection.addElement(d);
            this.save();
        }
    }

    delete() {
        let sel = this.multiselection.getSelection().map((e)=>e.getAttribute('multiselectindex')).sort((a,b)=>b-a);
        console.log(sel);
        for(let i of sel) {
            let d = this.multiselection.delete(i);
            d.remove();
            this.stamps.splice(i,1);
        }
        this.save();
    }


    save() {
        let ser = {stamps:this.stamps.map((s)=>s.serialize())};
        ser = JSON.stringify(ser);
        localStorage.setItem("stamps", ser);
    }

    fromTextArea() {
        let ser = JSON.parse(document.querySelector("#stamptext textarea").innerText);
        this.addFromJSON(ser);
    }

    addFromJSON(ser) {
        ser.stamps.forEach((stamp)=>this.add(Stamp.fromSerialization(this.board,stamp)));
    }

    load() {
        let ser = localStorage.getItem("stamps");
        if (ser) {
            ser = JSON.parse(ser);
            this.addFromJSON(ser);
        } else {
            this.addFromJSON(defaultStamps);
        }
    }
}

export default StampBox;