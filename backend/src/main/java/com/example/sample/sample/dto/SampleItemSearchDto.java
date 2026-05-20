package com.example.sample.sample.dto;

import com.example.sample.sample.domain.SampleItemStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SampleItemSearchDto {

    private String keyword;
    private SampleItemStatus status;
}
