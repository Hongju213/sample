package com.example.sample.sample.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.service.SampleItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "SampleItem", description = "샘플 아이템 CRUD API")
@RestController
@RequestMapping("/api/sample-items")
public class SampleItemController extends CommonResponse {

    private final SampleItemService sampleItemService;

    public SampleItemController(SampleItemService sampleItemService) {
        this.sampleItemService = sampleItemService;
    }

    @Operation(summary = "샘플 아이템 목록 조회 (페이징)")
    @GetMapping
    public ResponseEntity<Page<SampleItemDto>> selectSampleItems(
            SampleItemDto dto,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SampleItemDto> result = sampleItemService.selectSampleItems(dto, pageable);
        return success(result);
    }

    @Operation(summary = "샘플 아이템 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<SampleItemDto> selectSampleItemById(@PathVariable Long id) {
        return success(sampleItemService.selectSampleItemById(id));
    }

    @Operation(summary = "샘플 아이템 등록")
    @PostMapping
    public ResponseEntity<SampleItemDto> createSampleItem(@Valid @RequestBody SampleItemDto dto) {
        return success(sampleItemService.createSampleItem(dto));
    }

    @Operation(summary = "샘플 아이템 수정")
    @PutMapping("/{id}")
    public ResponseEntity<SampleItemDto> updateSampleItem(
            @PathVariable Long id,
            @Valid @RequestBody SampleItemDto dto) {
        return success(sampleItemService.updateSampleItem(id, dto));
    }

    @Operation(summary = "샘플 아이템 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Long>> deleteSampleItem(@PathVariable Long id) {
        sampleItemService.deleteSampleItem(id);
        return success(Map.of("id", id));
    }
}
