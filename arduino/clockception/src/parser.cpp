#include <Arduino.h>
#include "parser.h"

extern i2c_state state;
extern uint8_t buffer[241];
extern uint8_t buflen;


void parseCommand(Clock &clock) {
    switch (buffer[0]) {
    case 0:  // Home
      clock.home();
      break;
    case 1:
    case 2: // Animation Data
      clock.setAnimationData();
      break;
    case 3: // startAnimation
      clock.start();
      break;
    case 4: // return position and speed
      clock.sendState();
      break;
    }
}