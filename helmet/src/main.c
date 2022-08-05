#include <stdlib.h>
#include <stdio.h>
#include "mpu.h"

int main(int argc, char* argv[]) {
    mpu m;
    mpu_init(&m, 0x68);

    mpu_set_sample_rate(&m, 0x08);
    listen_clock_rate(&m);
    printf("$ %f\n", m.sample_rate);

    int cycles = 0;
    while (cycles < 1000) { 
        listen_gyro_coordinate(&m);
        listen_accl_coordinate(&m);
        printf("\r%f %f %f %f %f %f", m.gyro.x, m.gyro.y, m.gyro.z,  m.accl.x, m.accl.y, m.accl.z);
        fflush(stdout);
        delay(100);
        cycles++;
    }

    mpu_set_sample_rate(&m, 0x04);
    listen_clock_rate(&m);
    printf("$ %f\n", m.sample_rate);

    while (1) {
        listen_gyro_coordinate(&m);
        listen_accl_coordinate(&m);
        printf("\r%f %f %f %f %f %f", m.gyro.x, m.gyro.y, m.gyro.z,  m.accl.x, m.accl.y, m.accl.z);
        fflush(stdout);
        delay(100);
    }

}
