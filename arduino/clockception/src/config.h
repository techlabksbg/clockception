#pragma once
#include <Arduino.h>
#include <EEPROM.h>

struct Config {
    uint8_t address;
    uint16_t offset_m1;
    uint16_t offset_m2;
};



void saveConfig(Config &config);
void loadConfig(Config &config);
void showConfig(Config &config);
void configLoop(Config &config);