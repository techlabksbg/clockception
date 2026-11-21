#include <Arduino.h>
#include "clock.h"

uint8_t address = 8;  // Adresse von 8 bis und mit 119

uint8_t motor1[]={2,3,4,5, A0};
uint8_t motor2[]={6,7,8,9, A1};

Clock clock;

void setup() {
  Serial.begin(115200);
  Serial.println("Clockception begin...");
  clock.begin(address, motor1, motor2);
}

void loop() {
  clock.loop();
//  Serial.println(analogRead(A0));
//  delay(100);
}

