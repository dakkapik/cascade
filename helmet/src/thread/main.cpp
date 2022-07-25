#include <iostream>
#include <wiringPi.h>
#include <stdio.h>
#include <softPwm.h>
#include <thread>

#define SERVO_MIN_MS 0   // Define the pulse duration for minimum angle of servo
#define SERVO_MAX_MS 28  // Define the pulse duration for maximum angle of servo

#define servoPin 0       // Define the GPIO number connected to servo

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

void set_instruction(int* adrs) {
     while (true)
         std::cin >> *adrs;
 }

 int main(void) {
     float servoAngle = 24.0f;
     int instruction = 0;

     wiringPiSetup();            // Setup of GPIO pins to wiringPi pin layout
     servoInit(servoPin);        // Initialize PMW pin of servo, in this case 0 (GPIO 17)

     std::thread some(set_instruction, &instruction);

     while (true) {

         if (instruction == 0)
             servoWriteMS(servoPin, 6.0);
         else servoWriteMS(servoPin, 24.0);
     }

     some.join();
     return 0;
}
