#pragma once
#include <Arduino.h>

#define MAXFRAMES 40

class Animation {
    public:

    struct keyframe {
        int16_t s;   // Position in steps (gets normalized to 0-2047 after the animation)
        int16_t v;   // steps/s * 100  maxspeed would be 33333, so 32'000 is a good limit
        uint16_t t;  // Time in hundredth of a second (up to 65 seconds)
    };

    void push(int16_t s, int16_t v, uint16_t t);
    void push(keyframe &f);
    keyframe &shift();
    bool isEmpty();
    void clear();


    private:
    
    keyframe keyframes[MAXFRAMES];

    uint16_t firstFrame=0;  // First valid entry (if numFrames>0)
    uint16_t numFrames=0;   // Number entries

};