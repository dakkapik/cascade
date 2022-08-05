#include <iostream>
#include <thread>
#include <string>
#include <vector>

#include <wiringPi.h>
#include <softPwm.h>

#define SERVO_MIN_MS 0   // Define the pulse duration for minimum angle of servo
#define SERVO_MAX_MS 28  // Define the pulse duration for maximum angle of servo

#define servo_pitch 0
#define servo_yaw   7       // Define the GPIO number connected to servo

struct coordinate {
    double angx;
    double angy;
    double angz;
};

coordinate parseDataInput(std::string& input) {

    //array that will hold the values translated from a string to double in order
    //meaning values[0] is angular velocity x and values[1] is angular velocity y ...
    std::vector<double> values;

    // indexes that represent the index of the character of the string
    int begin = 0;
    int last  = 0;

    //Check that the index last is still in bounds of the string
    while (last <= input.length()) {
        //if we find that last points to ' ' or '\0' (end of line sentinel) then
        //we take the distance from begining to last - 1 (substract one since last in ' ')
        //take a substring from begining to distance and convert it to a double, advance last and beging = last
        if (input[last] == ' ' || input[last] == '\0') {
            values.push_back(std::stof(input.substr(begin, begin - last - 1)));
            begin = ++last;
        }
        else {
            last++;
        }
    }

    //There must be 3 values in values becuase is 3 angular velocities
    if (values.size() != 3) {
        std::cerr << "[ERROR] Number of arguments is different than 3" << std::endl;
    }

    //initializate object with respective values and return
    coordinate result =  {values[0], values[1], values[2]};
    return result;
}

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

void set_instruction(std::string* adrs) {
     while (true)
         std::cin >> *adrs;
 }

 int main(void) {     
     std::string instruction;

     wiringPiSetup();            // Setup of GPIO pins to wiringPi pin layout
     servoInit(servoPin);        // Initialize PMW pin of servo, in this case 0 (GPIO 17)

     std::thread some(set_instruction, &instruction);

    while (true) {
        coordinate result = parseDataInput(instruction);

        //Need to figure out a way to translate the coordinates into actual movements of the servos
        servoWriteMS(servo_pitch, pos(1));
        servoWriteMS(servo_yaw, pos(2));     
    }

     some.join();
     return 0;
}

