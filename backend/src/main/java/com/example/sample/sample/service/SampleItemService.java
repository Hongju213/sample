package com.example.sample.sample.service;

import com.example.sample.sample.dto.CreateSampleItemDto;
import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.dto.SampleItemSearchDto;
import com.example.sample.sample.dto.UpdateSampleItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SampleItemService {

    Page<SampleItemDto> selectSampleItems(SampleItemSearchDto sampleItemSearchDto, Pageable pageable);

    SampleItemDto selectSampleItemById(Long id);

    SampleItemDto createSampleItem(CreateSampleItemDto createSampleItemDto);

    SampleItemDto updateSampleItem(Long id, UpdateSampleItemDto updateSampleItemDto);

    void deleteSampleItem(Long id);
}
