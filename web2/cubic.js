
class Cubic {
    constructor(handstate0, handstate1, t1) {
        let s0 = Number(handstate0.angle);
        let v0 = Number(handstate0.v);
        let s1 = Number(handstate1.angle);
        let v1 = Number(handstate1.v);
        if (isNaN(s0)) throw "NaN";
        this.cubic = [(v0+v1)/t1/t1 + 2*(s0-s1)/t1/t1/t1,  (-v1-2*v0)/t1+3*(s1-s0)/t1/t1, v0, s0];
        this.quadratic = [3*this.cubic[0], 2*this.cubic[1], this.cubic[2]];
        this.linear = [2*this.quadratic[0], this.quadratic[1]];
        this.angle0 = s0;
        this.angle1 = s1;
        this.v0 = v0;
        this.v1 = v1;
        this.t1 = t1;
        this.a0 = this.linear[0];
        this.a1 = this.t1*this.linear[0]+this.linear[1];
    }

    init(s0,v0, s1, v1, t1) {
        this.cubic = [(v0+v1)/t1/t1 + 2*(s0-s1)/t1/t1/t1,  (-v1-2*v0)/t1+3*(s1-s0)/t1/t1, v0, s0];
        this.quadratic = [3*this.cubic[0], 2*this.cubic[1], this.cubic[2]];
        this.linear = [2*this.quadratic[0], this.quadratic[2]];
        this.angle0 = s0;
        this.angle1 = s1;
        this.v0 = v0;
        this.v1 = v1;
        this.t1 = t1;
        this.a0 = this.linear[0];
        this.a1 = this.t1*this.linear[0]+this.linear[1];
    }

    retime(t1) {
        this.init(this.angle0, this.v0, this.angle1, this.v1, t1);
        return this;
    }

    angle(t) {
        if (t<this.t1) {
            return ((this.cubic[0]*t+this.cubic[1])*t + this.cubic[2])*t + this.cubic[3];
        } else {
            return this.angle1 + this.v1*(t-this.t1);
        }
    }

    v(t) {
        if (t<this.t1) {
            return (this.quadratic[0]*t+this.quadratic[1])*t + this.quadratic[2];
        } else {
            return this.v1;
        }
    }
    
    maxv() {
        let v = Math.max(Math.abs(this.v0), Math.abs(this.v1));
        if (this.a0*this.a1>=0 || this.linear[0]==0) return v;
        let tinflexion = -this.linear[1]/this.linear[0];
        if (tinflexion<0 || tinflexion>this.t1) return v;
        let vext = (tinflexion*this.quadratic[0]+this.quadratic[1])*tinflexion+this.quadratic[2];
        return Math.max(v, Math.abs(vext));
    }

    maxa() {
        return Math.max(Math.abs(this.a0), Math.abs(this.a1));
    }

}

export default Cubic;