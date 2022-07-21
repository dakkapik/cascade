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
    float gx = read_raw_data(m->fd, GYRO_XOUT_H) / 131;
    float gy = read_raw_data(m->fd, GYRO_YOUT_H) / 131;
    float gz = read_raw_data(m->fd, GYRO_ZOUT_H) / 131;

    coordinate result = {gx, gy, gz};
    m->gyro = result;
}

void listen_accl_coordinate(mpu *m) {
   float ax = read_raw_data(m->fd, ACCEL_XOUT_H) / 16384.0;
   float ay = read_raw_data(m->fd, ACCEL_YOUT_H) / 16384.0;
   float az = read_raw_data(m->fd, ACCEL_ZOUT_H) / 16384.0;

   coordinate result =  {ax, ay, az};
   m->accl = result;
}

void mpu_init(mpu* m, int address) {
    m->fd = wiringPiI2CSetup(address);

    if (m->fd < 0) {
        fprintf(stderr, "Error initializing mpu with address provided: %i, error: %i", address, m->fd);
        return;
    }

    write(m, SMPLRT_DIV, 0X07);  // Set sample register default to 7
    write(m, PWR_MGMT_1, 0x01);  // Write to power managment register
    write(m, CONFIG, 0);         // Write to configuraiton register
    write(m, GYRO_CONFIG, 24);   // Write to gyro configuration register
    write(m, INT_ENABLE, 0x01);  // Write to interrupt enable register
}

void mpu_set_sample_rate(mpu* m, int value) {
    if (value < 0) return;
    write(m, SMPLRT_DIV, value);
}