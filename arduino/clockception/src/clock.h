#pragma once
#include <Arduino.h>
#include "cubicstepper.h"
#include "cubic.h"


typedef enum { IDLE, COMMAND, ANSWER} i2c_state;

class Clock {
    public:
    void begin(uint8_t address, uint8_t *pins1, uint8_t *pins2);
    void loop();

    void home();
    void start();
    void setAnimationData();
    void sendState();

    /*
    void setPositions(int p1, int p2, bool delayed=false);
    void getPositions(int &p1, int &p2);
    void setSpeeds(int s1, int s2, bool delayed=false);
    void getSpeeds(int &s1, int &s2);
    */

    private:


    CubicStepper m1;
    CubicStepper m2;
};