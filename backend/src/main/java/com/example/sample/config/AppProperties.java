package com.example.sample.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Security security,
        Cors cors
) {
    public record Security(String username, String password) {
    }

    public record Cors(String allowedOrigins) {
    }
}
