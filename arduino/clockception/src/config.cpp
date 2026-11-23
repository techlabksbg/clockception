#include "config.h"

void saveConfig(Config &config) {
    uint8_t *addr = (uint8_t *) &config;
    for (int i=0; i<sizeof(Config); i++) {
        EEPROM.write(i, addr[i]);
    }
}

void loadConfig(Config &config) {
    uint8_t *addr = (uint8_t *) &config;
    for (int i=0; i<sizeof(Config); i++) {
        addr[i] = EEPROM.read(i);
    }
}

void showConfig(Config &config) {
  Serial.println("Clockception Config");
  Serial.print("Adress:   ");
  Serial.println(config.address);
  Serial.print("Offset 1: ");
  Serial.println(config.offset_m1);
  Serial.print("Offset 2: ");
  Serial.println(config.offset_m2);
}

void showHelp() {
    Serial.println("h: show this help");
    Serial.println("a 123: set I2C address to 123 (decimal)");
    Serial.println("o1 42: set motor1 offset to 42 (decimal)");
    Serial.println("o2 67: set motor2 offset to 67 (decimal)");
}

int parseInt(char *buffer, int start, int buffer_length) {
    int res = 0;
    bool digits = false;
    bool neg = false;
    for (;start<buffer_length; start++) {
        if (buffer[start]>='0' && buffer[start]<='9') {
            digits = true;
            res *= 10;
            res += buffer[start]-'0';
        } else {
            if (digits) return neg ? -res : res;
            if (!digits && buffer[start]=='-') {
                neg = true;
                digits = true;
            }
        }
    }
    return neg ? -res : res;
}

void configLoop(Config &config) {
    static char buffer[20];
    static unsigned int nbytes = 0;
    static unsigned long lastChristmas = 0;
    bool enabled = true;
    if (!enabled) return;
    if ((millis()-lastChristmas)>10000L) {  // disable after 10 seconds
        enabled = false;
        return;
    }
    if (Serial.available()) {
        lastChristmas = millis()+20000L; // Keep open for another 20+10 seconds.
        if (nbytes<sizeof(buffer)) {
            buffer[nbytes++] = Serial.read();
        }
        if (nbytes == sizeof(buffer)) {
            Serial.println("Input too long, clearing buffer.");
            nbytes = 0;
        }
        if (nbytes>0 && (buffer[nbytes]==10 || buffer[nbytes]==13)) { // some newline arrived
            while (Serial.available()) Serial.read();
            if (buffer[0]=='h') {
                showHelp();
            }
            if (buffer[0]=='a') {
                int r = parseInt(buffer, 1, nbytes);
                if (r>=8 && r<=119) {
                    config.address = r;
                    Serial.print("\nAddress set to ");
                    Serial.println(config.address);
                    Serial.println("Reboot microcontroller to apply the change.");
                    saveConfig(config);
                } else {
                    Serial.print("Only addresses form 8 upto and including 119 are allowed.");
                }
            } else if (buffer[0]=='o' && (buffer[1]=='1' || buffer[1]=='2')) {
                int r = parseInt(buffer, 2, nbytes);
                r = ((r % 2048) + 2048) % 2048; // Constrain to 0-2047
                if (buffer[1]=='1') {
                    config.offset_m1 = r;
                } else {
                    config.offset_m1 = r;
                }
                Serial.print("Set offset of motor ");
                Serial.print(buffer[1]-'0');
                Serial.print(" to ");
                Serial.println(r);
                Serial.println("Reboot microcontroller to apply the change.");
                saveConfig(config);
            } else {
                Serial.println("Bad command.");
                showHelp();
            }
            nbytes = 0;            
        }
    }
}