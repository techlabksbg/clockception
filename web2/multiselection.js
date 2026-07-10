

class MultiSelection {

    constructor({elements, className="multiselected", shiftSelection=null, selectionCallback=null, clickCallback=null}) {
        this.className = className;
        this.shiftSelection = shiftSelection;
        this.selectionCallback = selectionCallback;
        this.clickCallback = clickCallback;
        this.elements = [];
        this.selected = [];
        for (let e of Array.from(elements)) {
            this.addElement(e);
        }
        this.lastSelected = -1;
    }

    addElement(e) {
        let i = this.elements.length;
        e.classList.remove(this.className);
        e.setAttribute('multiselectindex', i);
        e.addEventListener('click', (e)=>this.click(e,i));
        this.elements.push(e);
        this.n = this.elements.length;
        this.selected.push(false);
    }

    delete(i) {
        let [r] = this.elements.splice(i,1);
        this.selected.splice(i,1);
        this.n--;
        for (let j=i; j<this.n; j++) {
            this.elements[j].setAttribute('multiselectindex', j);
        }
        return r;
    }

    move(i,j) {
        
        if (i<0 || j<0 || i>=this.n || j>=this.n) return;
        let parent = this.elements[0].parentElement;
        let [r] = this.elements.splice(i,1);
        let [s] = this.selected.splice(i,1);
        this.elements.splice(j,0,r);
        this.selected.splice(j,0,s);
        for (let j=0; j<this.n; j++) {
            this.elements[j].setAttribute('multiselectindex', j);
            this.elements[j].remove();
        }
        for (let j=0; j<this.n; j++) {
            parent.appendChild(this.elements[j]);
        }
        if (this.lastSelected==i) {
            this.lastSelected = j;
        } else if (this.lastSelected==j) {
            this.lastSelected = i;
        }
    }

    getSelection() {
        return this.elements.filter((e,i)=>this.selected[i]);
    }

    select(i) {
        if (this.selected[i]) return;
        
        let e = this.elements[i];
        e.classList.add(this.className);
        this.selected[i] = true;
        this.lastSelected = i;
        if (this.selectionCallback!==null) {
            this.selectionCallback(i, true);
        }
    }

    deselect(i) {
        if (!this.selected[i]) return;
        
        let e = this.elements[i];
        e.classList.remove(this.className);
        this.selected[i] = false;
        if (this.selected.every((e)=>!e)) {
            this.lastSelected = -1;
        }
        if (this.selectionCallback!==null) {
            this.selectionCallback(i, false);
        }
    }

    toggle(i) {
        if (this.selected[i]) this.deselect(i); else this.select(i);
    }

    selectNone() {
        for (let j=0; j<this.n; j++) {
            this.deselect(j);
        }
    }
    
    selectAll() {
        for (let j=0; j<this.n; j++) {
            this.select(j);
        }
    }

    invert() {
        for (let j=0; j<this.n; j++) {
            this.toggle(j);
        }
    }

    click(e) {
        let shiftSelection = this.shiftSelection;
        if (shiftSelection===null) {
            shiftSelection = (low,high,i)=>(i>=low && i<=high);
        }

        let el = e.target;        
        while (el.getAttribute('multiselectindex')===null) {
            el = el.parentElement;
            if (el===null) return;
        }
        let i = Number(el.getAttribute('multiselectindex'));
        if (e.ctrlKey && !e.shiftKey) {
            this.toggle(i);
            if (this.clickCallback!==null) this.clickCallback(i);
            return;
        }
        if (e.shiftKey && this.lastSelected!=-1) {
            let low = Math.min(i,this.lastSelected);
            let high = Math.max(i,this.lastSelected);
            for (let j=0; j<this.n; j++) {
                if (shiftSelection(low,high,j)) {
                    this.select(j);
                } else if (!e.ctrlKey) {
                    this.deselect(j);
                }
            }
            if (this.selected.some((e)=>e)) {
                this.lastSelected = i;
            }
            if (this.clickCallback!==null) this.clickCallback(i);
            return;
        }
        for (let j=0; j<this.n; j++) {
            if (i==j) this.select(j); else this.deselect(j);
        }
        this.lastSelected = i;
        if (this.clickCallback!==null) this.clickCallback(i);
    }
};

export default MultiSelection;