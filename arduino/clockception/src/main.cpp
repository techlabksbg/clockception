#include <Arduino.h>
#include "clock.h"
#include "config.h"

uint8_t address = 8;  // Adresse von 8 bis und mit 119

uint8_t motor1_pins[]={2,3,4,5, A0};
uint8_t motor2_pins[]={6,7,8,9, A1};

Clock clock;
Config config;


void setup() {
  Serial.begin(115200);
  loadConfig(config);
  showConfig(config);
  clock.begin(config, motor1_pins, motor2_pins);
}

void loop() {
  clock.loop();
  configLoop(config);
//  Serial.println(analogRead(A0));
//  delay(100);
}

