package com.example.sample.sample.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.sample.dto.CreateSampleItemDto;
import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.dto.SampleItemSearchDto;
import com.example.sample.sample.dto.UpdateSampleItemDto;
import com.example.sample.sample.service.SampleItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "SampleItem", description = "Sample item CRUD API")
@RestController
@RequestMapping("/api/sample-items")
@RequiredArgsConstructor
public class SampleItemController extends CommonResponse {

    private final SampleItemService sampleItemService;

    @Operation(summary = "Select sample items")
    @GetMapping
    public ResponseEntity<Page<SampleItemDto>> selectSampleItems(
            SampleItemSearchDto sampleItemSearchDto,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SampleItemDto> findAllSampleItems = sampleItemService.selectSampleItems(sampleItemSearchDto, pageable);
        return success(findAllSampleItems);
    }

    @Operation(summary = "Select sample item")
    @GetMapping("/{id}")
    public ResponseEntity<SampleItemDto> selectSampleItemById(@PathVariable Long id) {
        return success(sampleItemService.selectSampleItemById(id));
    }

    @Operation(summary = "Create sample item")
    @PostMapping
    public ResponseEntity<SampleItemDto> createSampleItem(
            @Valid @RequestBody CreateSampleItemDto createSampleItemDto) {
        return success(sampleItemService.createSampleItem(createSampleItemDto));
    }

    @Operation(summary = "Update sample item")
    @PutMapping("/{id}")
    public ResponseEntity<SampleItemDto> updateSampleItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSampleItemDto updateSampleItemDto) {
        return success(sampleItemService.updateSampleItem(id, updateSampleItemDto));
    }

    @Operation(summary = "Delete sample item")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Long>> deleteSampleItem(@PathVariable Long id) {
        sampleItemService.deleteSampleItem(id);
        return success(Map.of("id", id));
    }
}
