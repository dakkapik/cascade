#include <iostream>
#include <wiringPi.h>
#include <stdio.h>
#include <softPwm.h>
#include <thread>

#define SERVO_MIN_MS 0   // Define the pulse duration for minimum angle of servo
#define SERVO_MAX_MS 28  // Define the pulse duration for maximum angle of servo

#define servo_pitch 0
#define servo_yaw   7       // Define the GPIO number connected to servo

void servoInit(int pin) {         // Initialization function for servo PMW pin
     softPwmCreate(pin, 0, 200);  // Using pin 0 (GPIO 17), position 0 degrees, and pmwRange of 200 (20ms)
}

void servoWriteMS(int pin, int ms) {     // Specify the unit for pulse (5-25ms) with specific duration output by servo pi    n: 0.1ms
     if (ms > SERVO_MAX_MS)               // In other words, set the rotation limits to prevent going past the physical ca    pabilities of the servo
         ms = SERVO_MAX_MS;
     if (ms < SERVO_MIN_MS)
         ms = SERVO_MIN_MS;
     softPwmWrite(pin, ms);               // This function makes the servo move
 }

std::tuple<int, int> parse_position(std::string input) {
    std::string x;
    int last_input = 0;
    for (int i = 0; i < input.length(); i++) {
        if (input[i] != " ") {
            x.append(input[i]);
        } else { last_input = i; break; }
    }

    std::string y;
    for (int i = last_input + 1; i < input.length(); i++) {
        if (input[i] != " ") {
            y.append(input[i]);
        } else { break; }
    }

    return std::make_tuple(stoi(x), stoi(y));
}

void set_instruction(std::string* adrs) {
     while (true)
         std::cin >> *adrs;
 }

 int main(void) {
     float servoAngle = 24.0f;
     std::string instruction;
     bool isLeft = false;

     wiringPiSetup();            // Setup of GPIO pins to wiringPi pin layout
     servoInit(servoPin);        // Initialize PMW pin of servo, in this case 0 (GPIO 17)

     std::thread some(set_instruction, &instruction);

    while (true) {
        std::tupple<int, int> pos = parse_position(instruction);
        servoWriteMS(servo_pitch, pos(1));
        servoWriteMS(servo_yaw, pos(2));     
    }

     some.join();
     return 0;
}

