#include <Arduino.h>
#include "cubic.h"
#include "animation.h"

// Number of steps for a full revolution
#define FULL_REVOLUTION 2048
// Minimal duration of a step (in us)
#define MIN_TICK_DURATION (3000L)

class CubicStepper {
    public:
    enum State {
        IDLE,
        HOMING,
        CUBING,
        CONST_V,
    };

    int id=0;

    void begin(uint8_t* pins, bool inverted=false);  // 5 Pins: 0-3 are motor pins, 4 is analog pin from hall sensor.
    State getState();
    int16_t getPosition();
    int16_t getSpeed();
    void home(int offset=0);
    void start(); // Start animation
    void loop();
    Animation* getAnimation();

    private:

    void forward();
    void backward();
    void off();
    void homing();
    void cubing();
    void nextFrame();

    int16_t s=0;    // Position in steps
    float speed = 0.0f;  // Speed in steps/us
    uint8_t step=0; // Substep (0-4);
    uint8_t* pins;

    State state=IDLE;

    unsigned long startus = 0;  // When cubic animation startet
    unsigned long nextus = 0;   // When the next thing should/could happen
    Cubic c;

    int maxHallValue = 0;
    int minHallValue = 1024;
    int maxHallPosition = 0;
    int minHallPosition = 0;
    int homeOffset = 0;

    bool inverted = false;

    Animation animation;
};