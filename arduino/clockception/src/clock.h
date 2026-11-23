#pragma once
#include <Arduino.h>
#include "cubicstepper.h"
#include "config.h"


typedef enum { IDLE, COMMAND, ANSWER} i2c_state;

class Clock {
    public:
    void begin(Config config, uint8_t *pins1, uint8_t *pins2);
    void loop();

    void home();
    void start();
    void setAnimationData();
    void sendState();

    private:

    CubicStepper m1;
    CubicStepper m2;
    Config config;
};