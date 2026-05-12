package com.example.sample.sample.service;

import com.example.sample.sample.dto.SampleItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SampleItemService {

    Page<SampleItemDto> selectSampleItems(SampleItemDto dto, Pageable pageable);

    SampleItemDto selectSampleItemById(Long id);

    SampleItemDto createSampleItem(SampleItemDto dto);

    SampleItemDto updateSampleItem(Long id, SampleItemDto dto);

    void deleteSampleItem(Long id);
}
