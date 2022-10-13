#include "mpu.h"

void write(mpu *m, int address, int value) {
    //TODO: Error handling
    int result = wiringPiI2CWriteReg8(m->fd, address, value);
}

short read_raw_data(int fd, int addr) {
    short high_byte, low_byte, value;

    // Gyroscope and Accelerometer are 16 bit values,
    // but for some reason we can read 1 byte at a time
    // so we concatenate the 2 bytes together.
    high_byte = wiringPiI2CReadReg8(fd, addr);
    low_byte = wiringPiI2CReadReg8(fd, addr+1);

    value = (high_byte << 8) | low_byte;
    return value;
}

void listen_gyro_coordinate(mpu *m) {
    // float gx = read_raw_data(m->fd, GYRO_XOUT_H) / 131.0;
    // float gy = read_raw_data(m->fd, GYRO_YOUT_H) / 131.0;
    // float gz = read_raw_data(m->fd, GYRO_ZOUT_H) / 131.0;
    float gx = read_raw_data(m->fd, GYRO_XOUT_H) / 65.5;
    float gy = read_raw_data(m->fd, GYRO_YOUT_H) / 65.5;
    float gz = read_raw_data(m->fd, GYRO_ZOUT_H) / 65.5;

    
    coordinate result = {gx, gy, gz};
    m->gyro = result;
}

void listen_accl_coordinate(mpu *m) {
//    float ax = read_raw_data(m->fd, ACCEL_XOUT_H) / 16384.0;
//    float ay = read_raw_data(m->fd, ACCEL_YOUT_H) / 16384.0;
//    float az = read_raw_data(m->fd, ACCEL_ZOUT_H) / 16384.0;
   float ax = read_raw_data(m->fd, ACCEL_XOUT_H);
   float ay = read_raw_data(m->fd, ACCEL_YOUT_H);
   float az = read_raw_data(m->fd, ACCEL_ZOUT_H);


   coordinate result =  {ax, ay, az};
   m->accl = result;
}

//The sample rate is given by: Sample rate = Gyroscope output rate / (1 + SMPLRT_DIV)
// Gyroscope output rate is 8kHz if the DLPF (digital low pass filter) is disabled (which it is)
// in case that the DLPF is enabled the Gyroscope output rate would drop to 1kHz
void listen_clock_rate(mpu *m) {
   
    //Check if the low pass filter is enabled if so the output rate is 1000 if not 8000
    int gyro_output_rate = 2000;

    // if (wiringPiI2CReadReg8(m->fd, CONFIG)) {
    //     gyro_output_rate = 1000;
    // } else {
    //     gyro_output_rate = 8000;
    // }

    unsigned int divisor = wiringPiI2CReadReg8(m->fd, SMPLRT_DIV) + 1;

    m->sample_rate = gyro_output_rate / divisor;
}

void mpu_init(mpu* m, int address) {
    m->fd = wiringPiI2CSetup(address);

    if (m->fd < 0) {
        fprintf(stderr, "Error initializing mpu with address provided: %i, error: %i", address, m->fd);
        return;
    }
    
    write(m, SMPLRT_DIV, 0X07);  // Set sample register default to 7
    write(m, PWR_MGMT_1, 0x01);  // Write to power managment register
    write(m, CONFIG, 0);         // Write to configuraiton register (Low pass filter disabled when 0)
    write(m, GYRO_CONFIG, 24);   // Write to gyro configuration register
    write(m, INT_ENABLE, 0x01);  // Write to interrupt enable register
}

// Domain [0, 7]
void mpu_set_sample_rate_divisor(mpu* m, int value) {
    if (value < 0) return;
    write(m, SMPLRT_DIV, value);
}
