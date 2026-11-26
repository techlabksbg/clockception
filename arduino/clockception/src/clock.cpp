#include "clock.h"
#include <Wire.h>
#include "parser.h"
#include "animation.h"

i2c_state state = IDLE;
uint8_t buffer[241];  // Buffer for I2C communication
uint8_t buflen = 0; // Length of valid buffer

void i2c_request_handler() {
  Serial.print(buflen);
  Serial.print(" bytes: ");
  for (int i=0; i<buflen; i++) {
    Wire.write(buffer[i]);
    Serial.print(buffer[i]);
    Serial.print(' ');
  }
  Serial.println();
  state = IDLE;
}

void i2c_receive_handler(int numBytes) {
  for (int i=0; i<numBytes; i++) {
    if (Wire.available()) {
      buffer[i] = Wire.read();
    }
  }
  buflen = numBytes;
  state = COMMAND;
}



void Clock::begin(Config _config, uint8_t *pins1, uint8_t *pins2) {
    config = config;
    // Set up motors
    m1.begin(pins1, true); // invert the first motor, so both turn left
    m1.id = 1;
    m2.begin(pins2, false);
    m2.id = 2;

    // Set up I2C Link
    Wire.begin(config.address);
    TWAR |= 1;  // Enable listening to I2C-Broadcast Address 0
    Wire.onReceive(i2c_receive_handler);
    Wire.onRequest(i2c_request_handler);

    home();
}


void Clock::loop() {
    // Check on motors
    m1.loop();
    m2.loop();

    // Check I2C-Commands
    if (state == COMMAND) {
        state = IDLE;
        parseCommand(*this);
    }
   
    // Demo code.  
    if ((m2.getState()==m2.CONST_V || m2.getState()==m2.IDLE) && (m1.getState()==m1.CONST_V || m1.getState()==m1.IDLE)) {
        m2.getAnimation()->clear();
        m1.getAnimation()->clear();
        Animation::keyframe f;
        f.s = 2048+512;
        f.v = 15000;
        f.t = 15000;
        m2.getAnimation()->push(f);
        f.s = -2048+512;
        f.v = -15000;
        m1.getAnimation()->push(f);

        f.s = -2048;
        f.v = 0;
        f.t = 15000;
        m2.getAnimation()->push(f);
        m1.getAnimation()->push(f);

        start();

    } 
}

void Clock::home() {
    int zero1 = config.offset_m1;
    int zero2 = 1024+config.offset_m2;
    m1.home(zero1);
    m2.home(zero2);
}

// Sets stored positions and speed (if set previously)
void Clock::start() {
    Serial.println("Starting animation");
    m1.start();
    m2.start();
}

void Clock::setAnimationData() {
    Animation *animation;
    if (buffer[0]==1) {
        animation = m1.getAnimation();
    } else {
        animation = m2.getAnimation();
    }
    animation->clear();
    
    for (uint8_t s=1; s<buflen; s+=sizeof(Animation::keyframe)) {        
        animation->push(*((Animation::keyframe *)(buffer+s)));
    }
}

void Clock::sendState() {
    struct message {
        int16_t s0;
        int16_t s1;
        int16_t v0;
        int16_t v1;
    } *msg = (message*)buffer;
    
    msg->s0 = m1.getPosition();
    msg->s1 = m2.getPosition();
    msg->v0 = m1.getSpeed();
    msg->v1 = m2.getSpeed();
    buflen = sizeof(message);
    state = ANSWER;
}