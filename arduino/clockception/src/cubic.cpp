#include <Arduino.h>
#include "cubic.h"

Cubic::Cubic() {}

Cubic::Cubic(int _s0, float _v0, int _s1, float _v1, unsigned long _t1) {
    set(_s0, _v0, _s1, _v1, _t1);
}

void Cubic::set(int _s0, float _v0, int _s1, float _v1, unsigned long _t1) {
    s0 = _s0;
    v0 = _v0;
    s1 = _s1;
    v1 = _v1;
    t1 = _t1;
    //  let cubic = [(v0+v1)/t1/t1 + 2*(s0-s1)/t1/t1/t1,  (-v1-2*v0)/t1+3*(s1-s0)/t1/t1, v0, s0];
    float ti = 1.0f/t1;
    c[0] = (v0+v1)*ti*ti + 2.0f*(s0-s1)*ti*ti*ti;
    c[1] = (-v1-2*v0)*ti+3*(s1-s0)*ti*ti;
    c[2] = v0;
    c[3] = (float) s0;
}

float Cubic::s(float t) {
    if (t<t1) {
        return ((t*c[0] + c[1])*t + c[2])*t + c[3];
    } else {
        return s1+v1*(t-t1);
    }
}

float Cubic::v(float t) {
    if (t>t1) {
        return v1;
    }
    return (3.0f*t*c[0] + 2.0f*c[1])*t + c[2];
}