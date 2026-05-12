package com.example.sample.sample.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.mapper.SampleItemMapper;
import com.example.sample.sample.service.SampleItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SampleItemServiceImpl implements SampleItemService {

    private static final Logger log = LoggerFactory.getLogger(SampleItemServiceImpl.class);

    private final SampleItemMapper sampleItemMapper;
    private final MessageHandler messageHandler;

    public SampleItemServiceImpl(SampleItemMapper sampleItemMapper, MessageHandler messageHandler) {
        this.sampleItemMapper = sampleItemMapper;
        this.messageHandler = messageHandler;
    }

    @Override
    public Page<SampleItemDto> selectSampleItems(SampleItemDto dto, Pageable pageable) {
        List<SampleItemDto> findAll = sampleItemMapper.findAllBySampleItemDto(dto, pageable.getOffset(), pageable.getPageSize());
        int totalCount = sampleItemMapper.countBySampleItemDto(dto);
        return new PageImpl<>(findAll, pageable, totalCount);
    }

    @Override
    public SampleItemDto selectSampleItemById(Long id) {
        return sampleItemMapper.findById(id)
                .orElseThrow(() -> messageHandler.notFound("SampleItem", id));
    }

    @Override
    @Transactional
    public SampleItemDto createSampleItem(SampleItemDto dto) {
        sampleItemMapper.insert(dto);
        return selectSampleItemById(dto.getId());
    }

    @Override
    @Transactional
    public SampleItemDto updateSampleItem(Long id, SampleItemDto dto) {
        dto.setId(id);
        int count = sampleItemMapper.update(dto);
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
