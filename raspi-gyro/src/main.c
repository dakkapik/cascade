#include <stdlib.h>
#include <stdio.h>
#include "mpu.h"

int main(int argc, char* argv[]) {
    mpu m;
    mpu_init(&m, 0x68);

    mpu_set_sample_rate(&m, 0x07);
    while (1) {
        listen_accl_coordinate(&m);
        printf("\rx: %f, y: %f, z: %f", m.accl.x, m.accl.y, m.accl.z);
        fflush(stdout);
        delay(100);
    }

}