#pragma once
// Units: steps, us

// At least 3ms per step
#define VMAX (1.0f/3000.0f)


class Cubic {
    public:
    Cubic();
    Cubic(int s0, float v0, int s1, float v1, unsigned long t1);

    void set(int s0, float v0, int s1, float v1, unsigned long t1);

    unsigned long t1;
    int s0,s1;
    float v0, v1, vmax;

    float s(float t);
    float v(float t);


    private:
    float c[4];
};