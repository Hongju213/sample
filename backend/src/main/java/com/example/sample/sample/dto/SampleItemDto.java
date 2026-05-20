package com.example.sample.sample.dto;

import com.example.sample.sample.domain.SampleItemStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SampleItemDto {

    private Long id;
    private String title;
    private String description;
    private SampleItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
