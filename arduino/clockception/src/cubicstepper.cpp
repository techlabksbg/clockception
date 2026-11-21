#include "cubicstepper.h"


void CubicStepper::begin(uint8_t *_pins, bool _inverted) {
    pins = _pins;
    inverted = _inverted;
    for (uint8_t i=0; i<4; i++) {
        pinMode(pins[i], OUTPUT);
        digitalWrite(pins[i], LOW);
    }
    
}

void CubicStepper::off() {
    digitalWrite(pins[step], LOW);
}

void CubicStepper::homing() {
    unsigned long now = micros();
    if (now>nextus) {
        int v = analogRead(pins[4]);
        
        if (v>maxHallValue) {
            Serial.print("M");
            Serial.print(id);
            Serial.print(" hall=");
            Serial.println(v);
            maxHallValue = v;
            maxHallPosition = s;
        }
        if (v<minHallValue) {
            Serial.print("M");
            Serial.print(id);
            Serial.print(" hall=");
            Serial.println(v);
            minHallValue = v;
            minHallPosition = s;
        }
        forward();
        nextus = now+MIN_TICK_DURATION;
        if (s>FULL_REVOLUTION) {
            int zeroPos = maxHallPosition;
            if ((512-minHallPosition)>(maxHallPosition-512)) {
                zeroPos = minHallPosition;
            }
            s -= zeroPos;
            s += homeOffset;
            s = s % FULL_REVOLUTION;
            Serial.print("M");
            Serial.print(id);
            Serial.print("  Full rev, zeroPosition: ");
            Serial.print(zeroPos);
            Serial.print("  now at pos ");
            Serial.print(s);

            speed = 1.0f/MIN_TICK_DURATION;
            int ds = -s;
            if (ds<-FULL_REVOLUTION/2) {
                ds = FULL_REVOLUTION-s;
            }
            unsigned long t = 4000000L + abs(ds)*MIN_TICK_DURATION*3L;
            c.set(s, speed, s+ds, 0, t);
            Serial.print(" ds=");
            Serial.print(ds);
            Serial.print(" speed=");
            Serial.print(speed);
            Serial.print(" t=");
            Serial.println(t);
            Serial.print("s(0)=");
            Serial.print(c.s(0));
            Serial.print(" v(0)=");
            Serial.print(c.v(0)*1.e6f);
            Serial.print("   s(t)=");
            Serial.print(c.s(t));
            Serial.print(" v(t)=");
            Serial.println(c.v(t)*1.e6f);

            startus = now;
            nextus = startus;
            state = CUBING;
        }
    }
}

void CubicStepper::cubing() {
    unsigned long now = micros();
    unsigned long t = now-startus;
    if (now>nextus) {
        if (state==CUBING && t>c.t1) {
            Serial.print("t=");
            Serial.print(t);
            Serial.print("  c.t1=");
            Serial.println(c.t1);
            if (!animation.isEmpty()) {
                nextFrame();
            } else {
                if (abs(c.v1)==0) {
                    off();
                    state = IDLE;
                } else {
                    state = CONST_V;
                    speed = c.v1;
                }
            }
        } else {
            speed = c.v(t);
            if (abs(speed)>1.0f/MIN_TICK_DURATION) {
                if (speed>0.0f) {
                    speed = 1.0f/MIN_TICK_DURATION; 
                } else {
                    speed = -1.0f/MIN_TICK_DURATION;
                }
            }
        }
        int16_t soll=floor(c.s(t)+0.5);
        /*Serial.print("soll=");
        Serial.print(soll);
        Serial.print("  s=");
        Serial.print(s); */
        if (soll!=s) {
            nextus = now + MIN_TICK_DURATION;  // Enforce maxspeed
            /*if (abs(soll-s)>1) {
                Serial.print("Too fast! 1/speed=");
                Serial.println(1/c.v(t));
            }*/
        }
        if (soll>s) {
            forward();
        } else if (soll<s) {
            backward();
        }
        /*Serial.print("  after s=");
        Serial.println(s); */

        
        if (now>nextus+20000L) { // Turn off coil after 20ms
            digitalWrite(pins[step], LOW);
        }
        
    }
}

void CubicStepper::nextFrame() {
    if (animation.isEmpty()) return;
    Animation::keyframe* frame;
    frame = &animation.shift();
    // Normalize current position
    s = ((s % FULL_REVOLUTION) + FULL_REVOLUTION) % FULL_REVOLUTION;
    float s1 = frame->s;
    float v1 = frame->v*1e-8;  // Steps/us
    unsigned long t1 = frame->t * 1000L;  // Duration in us
    c.set(s, speed, s1, v1, t1);
    Serial.print("M");
    Serial.print(id);
    Serial.print("  new cubic from s0=");
    Serial.print(s);
    Serial.print(" v0=");
    Serial.print(speed*1e6f);
    Serial.print("  to s1=");
    Serial.print(s1);
    Serial.print(" v1=");
    Serial.print(v1*1e6f);
    Serial.print(" t1=");
    Serial.println(t1);
    startus = micros();
    nextus = startus;
    state = CUBING;
}

CubicStepper::State CubicStepper::getState() {
    return state;
}

int16_t CubicStepper::getPosition() {
    return s;
}

int16_t CubicStepper::getSpeed() {
    if (state==CUBING) {
        speed = c.v(micros()-startus);
    }
    return speed*1e8f;
}

void CubicStepper::home(int offset) {
    homeOffset = offset;
    animation.clear();
    s = 0;
    maxHallValue = 0;
    state = HOMING;
}

void CubicStepper::start() {
    nextFrame();
}

void CubicStepper::loop() {
    switch (state) {
    case HOMING:
        homing();
        break;
    case CUBING:
    case CONST_V:
        cubing();
        break;
    case IDLE:
        break;
    }
}

Animation *CubicStepper::getAnimation() {
    return &animation;
}

void CubicStepper::forward()
{
    digitalWrite(pins[step], LOW);
    step = (step+(inverted ? 3 : 1))&3;
    s++;
    digitalWrite(pins[step], HIGH);
}

void CubicStepper::backward() {
    digitalWrite(pins[step], LOW);
    step = (step+(inverted ? 1 : 3))&3;
    s--;
    digitalWrite(pins[step], HIGH);
}
