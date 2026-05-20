package com.example.sample.common.dto;

public record ResultDto(
        boolean success,
        String message,
        Long id
) {
    public static ResultDto ok(String message) {
        return new ResultDto(true, message, null);
    }

    public static ResultDto ok(String message, Long id) {
        return new ResultDto(true, message, id);
    }
}
