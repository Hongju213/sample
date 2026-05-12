package com.example.sample.sample.service;

import com.example.sample.sample.domain.SampleItem;
import com.example.sample.sample.dto.SampleItemRequest;
import com.example.sample.sample.dto.SampleItemResponse;
import com.example.sample.sample.mapper.SampleItemMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class SampleItemService {
    private final SampleItemMapper sampleItemMapper;

    public SampleItemService(SampleItemMapper sampleItemMapper) {
        this.sampleItemMapper = sampleItemMapper;
    }

    public List<SampleItemResponse> findAll(String keyword) {
        return sampleItemMapper.findAll(keyword).stream()
                .map(SampleItemResponse::from)
                .toList();
    }

    public SampleItemResponse findById(Long id) {
        return sampleItemMapper.findById(id)
                .map(SampleItemResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Sample item not found. id=" + id));
    }

    @Transactional
    public SampleItemResponse create(SampleItemRequest request) {
        var item = toEntity(null, request);
        sampleItemMapper.insert(item);
        return findById(item.getId());
    }

    @Transactional
    public SampleItemResponse update(Long id, SampleItemRequest request) {
        var item = toEntity(id, request);
        var count = sampleItemMapper.update(item);
        if (count == 0) {
            throw new NoSuchElementException("Sample item not found. id=" + id);
        }
        return findById(id);
    }

    @Transactional
    public void delete(Long id) {
        var count = sampleItemMapper.deleteById(id);
        if (count == 0) {
            throw new NoSuchElementException("Sample item not found. id=" + id);
        }
    }

    private SampleItem toEntity(Long id, SampleItemRequest request) {
        var item = new SampleItem();
        item.setId(id);
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setStatus(request.status());
        return item;
    }
}
