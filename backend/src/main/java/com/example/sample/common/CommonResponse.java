package com.example.sample.common;

import org.springframework.http.ResponseEntity;

public class CommonResponse {

    protected <T> ResponseEntity<T> success(T data) {
        return ResponseEntity.ok(data);
    }

    protected ResponseEntity<Void> success() {
        return ResponseEntity.noContent().build();
    }
}
