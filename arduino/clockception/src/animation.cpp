#include "animation.h"

void Animation::push(int16_t s, int16_t v, uint16_t t) {
    if (numFrames<MAXFRAMES) {
        uint8_t i = (firstFrame+numFrames)%MAXFRAMES;
        keyframes[i].s = s;
        keyframes[i].v = v;
        keyframes[i].t = t;
        numFrames++;
    }
}

void Animation::push(Animation::keyframe &f) {
    if (numFrames<MAXFRAMES) {
        keyframes[(firstFrame+numFrames)%MAXFRAMES] = f;
        numFrames++;
    }
}

Animation::keyframe &Animation::shift() {
    if (numFrames>0)  {
        uint8_t i = firstFrame;
        numFrames--;
        firstFrame = (firstFrame+1)%MAXFRAMES;
        return keyframes[i];
   }
   return keyframes[firstFrame];
}

bool Animation::isEmpty() {
    return numFrames==0;
}

void Animation::clear() {
    numFrames = 0;
}
