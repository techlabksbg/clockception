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


long Cubic::nextT(int s, long t) {
    if (t1-t<50) return t1;
    float tp = solve(s+1, t);
    float tm = solve(s-1, t);
    if (tp>t1) {
        tp = t1;
    }
    if (tm>t1) {
        tm = t1;
    }
    if (tp>-1 && (tm<0 || tm>tp)) {
        return tp;
    }
    if (tm>-1 && (tp<0 || tp>tm)) {
        return tm;
    }
    return t1;
}

float Cubic::solve(float x, long tmin) {
    if (c[0]==0) { // Quadratic formula
        float a=c[1];
        float b=c[2];
        float c=this->c[3]-x;
        if (a==0) { // Linear formula
            if (b==0) {  // Constant, boring
                return -1;
            }
            return -c/b;
        }
        // solve quadratic;
        float d = b*b-4*a*c;
        if (d<0) {
            return -1;
        }
        if (d==0) {
            return -b/2/a;
        }
        d = sqrt(d);
        x = (-b-d)/2/a;
        if (x>tmin) {
            return x;
        }
        return (-b+d)/2/a;
    }
    float b = c[1]/c[0];
    float d = (c[3]-x)/c[0];
    float c = this->c[2]/this->c[0];
    float p = c - b*b/3.0f;
    float q = 2*b*b*b/27 - b*c/3 + d;

    float discriminant = q*q/4 + p*p*p/27;

    if (discriminant > 0) {
        float u = cbrt(-q / 2 + sqrt(discriminant));
        float v = cbrt(-q / 2 - sqrt(discriminant));

        float t = u + v;
        if (t>tmin) return t;
        return -1;        
    } else if (discriminant == 0) {
        // All roots real, at least two equal
        float u = cbrt(-q/2);
        float t1 = 2*u - b/3;
        float t2 = -u - b/3;
        if (t1>tmin && (t2<tmin || t2>t1)) {
            return t1;
        } else if (t2>tmin) {
            return t2;
        } else {
            return -1;
        }
    } else {
        // Three distinct real roots
        float r = sqrt(-p*p*p/27);
        float phi = s(-q/(2*r));
        float tr = 2*cbrt(r);
        float t1 = tr*cos(phi/3) - b/3;
        float t2 = tr*cos((phi + 2*PI)/3) - b/3;
        float t3 = tr*cos((phi + 4*PI)/3) - b/3;
        if (t1>tmin && (t2<tmin || t2>t1) && (t3<tmin || t3>t1)) {
            return t1;
        }
        if (t2>tmin && (t1<tmin || t1>t2) && (t3<tmin || t3>t2)) {
            return t2;
        }
        if (t3>tmin && (t2<tmin || t2>t3) && (t1<tmin || t1>t3)) {
            return t3;
        }
        return -1;
    }       
}
