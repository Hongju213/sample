package com.example.sample.sample.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.sample.dto.CreateSampleItemDto;
import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.dto.SampleItemSearchDto;
import com.example.sample.sample.dto.UpdateSampleItemDto;
import com.example.sample.sample.mapper.SampleItemMapper;
import com.example.sample.sample.service.SampleItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SampleItemServiceImpl implements SampleItemService {

    private final SampleItemMapper sampleItemMapper;
    private final MessageHandler messageHandler;

    @Override
    public Page<SampleItemDto> selectSampleItems(SampleItemSearchDto sampleItemSearchDto, Pageable pageable) {
        List<SampleItemDto> findAll = sampleItemMapper.findAllBySampleItemSearchDto(
                sampleItemSearchDto,
                pageable.getOffset(),
                pageable.getPageSize());
        int totalCount = sampleItemMapper.countBySampleItemSearchDto(sampleItemSearchDto);
        return new PageImpl<>(findAll, pageable, totalCount);
    }

    @Override
    public SampleItemDto selectSampleItemById(Long id) {
        return sampleItemMapper.findById(id)
                .orElseThrow(() -> messageHandler.notFound("SampleItem", id));
    }

    @Override
    @Transactional
    public SampleItemDto createSampleItem(CreateSampleItemDto createSampleItemDto) {
        SampleItemDto sampleItemDto = new SampleItemDto();
        sampleItemDto.setTitle(createSampleItemDto.getTitle());
        sampleItemDto.setDescription(createSampleItemDto.getDescription());
        sampleItemDto.setStatus(createSampleItemDto.getStatus());

        sampleItemMapper.insert(sampleItemDto);
        return selectSampleItemById(sampleItemDto.getId());
    }

    @Override
    @Transactional
    public SampleItemDto updateSampleItem(Long id, UpdateSampleItemDto updateSampleItemDto) {
        SampleItemDto sampleItemDto = new SampleItemDto();
        sampleItemDto.setId(id);
        sampleItemDto.setTitle(updateSampleItemDto.getTitle());
        sampleItemDto.setDescription(updateSampleItemDto.getDescription());
        sampleItemDto.setStatus(updateSampleItemDto.getStatus());

        int count = sampleItemMapper.update(sampleItemDto);
        if (count == 0) {
            throw messageHandler.notFound("SampleItem", id);
        }
        return selectSampleItemById(id);
    }

    @Override
    @Transactional
    public void deleteSampleItem(Long id) {
        int count = sampleItemMapper.deleteById(id);
        if (count == 0) {
            throw messageHandler.notFound("SampleItem", id);
        }
    }
}
