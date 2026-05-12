package com.example.sample.sample.dto;

import com.example.sample.sample.domain.SampleItem;
import com.example.sample.sample.domain.SampleItemStatus;

import java.time.LocalDateTime;

public record SampleItemResponse(
        Long id,
        String title,
        String description,
        SampleItemStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static SampleItemResponse from(SampleItem item) {
        return new SampleItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
