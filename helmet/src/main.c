#include <stdlib.h>
#include <stdio.h>
#include "mpu.h"

#define GYRO_LOCATION_I2C  0x68
#define FAST_SAMPLE_RATE   0X07
#define NORMAL_SAMPLE_RATE 0x04

int main(int argc, char* argv[]) {
    mpu m;
    mpu_init(&m, GYRO_LOCATION_I2C);

    mpu_set_sample_rate_divisor(&m, FAST_SAMPLE_RATE);
    listen_clock_rate(&m);
    printf("$ %f\n", m.sample_rate);

    int cycles = 0;
    while (cycles < 500) { 
        listen_gyro_coordinate(&m);
        listen_accl_coordinate(&m);
        printf("%f %f %f %f %f %f %f", m.gyro.x, m.gyro.y, m.gyro.z,  m.accl.x, m.accl.y, m.accl.z, m.sample_rate);
        fflush(stdout);
        cycles++;
    }

    mpu_set_sample_rate_divisor(&m, NORMAL_SAMPLE_RATE);
    listen_clock_rate(&m);
    printf("$ %f\n", m.sample_rate);

    while (1) {
        listen_gyro_coordinate(&m);
        listen_accl_coordinate(&m);
        printf("%f %f %f %f %f %f %f", m.gyro.x, m.gyro.y, m.gyro.z,  m.accl.x, m.accl.y, m.accl.z, m.sample_rate);
        fflush(stdout);
    }

}
