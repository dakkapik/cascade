#include <stdlib.h>
#include <stdio.h>
#include "mpu.h"

int main(int argc, char* argv[]) {
    mpu m;
    mpu_init(&m, 0x68);

    mpu_set_sample_rate(&m, 0x07);
    printf("$ %f\n", m->sample_rate);

    //Runtime of the chip
    while (1) {
        listen_gyro_coordinate(&m);
        listen_accl_coordinate(&m);
        printf("\r%f %f %f %f %f %f", m.gyro.x, m.gyro.y, m.gyro.z,  m.accl.x, m.accl.y, m.accl.z);
        fflush(stdout);
        delay(100);
    }

}
