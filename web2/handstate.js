

class HandState {
    constructor(hand) {
        if (hand!==null) {
            this.angle = hand.angle;
            this.v = hand.v;
        } else {
            this.angle = 0;
            this.v = 0;
        }
    }

    clone() {
        let copy = new HandState(null);
        copy.v = this.v;
        copy.angle = this.angle;
        return copy;
    }

    serialize() {
        return {angle:this.angle, v:this.v};
    }

    static fromSerialization(s) {
        let hs = new HandState(null);
        hs.angle = s.angle;
        hs.v = s.v;
        return hs;
    }
}

export default HandState;