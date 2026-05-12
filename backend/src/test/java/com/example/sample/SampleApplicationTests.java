package com.example.sample;

import org.junit.jupiter.api.Test;

class SampleApplicationTests {

    @Test
    void mainClassExists() {
        org.assertj.core.api.Assertions.assertThat(SampleApplication.class).isNotNull();
    }
}
