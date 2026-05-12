package com.example.sample.sample.dto;

import com.example.sample.sample.domain.SampleItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SampleItemRequest(
        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 1000)
        String description,

        @NotNull
        SampleItemStatus status
) {
}
