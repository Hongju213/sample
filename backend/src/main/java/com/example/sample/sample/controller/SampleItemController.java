package com.example.sample.sample.controller;

import com.example.sample.common.ApiResponse;
import com.example.sample.sample.dto.SampleItemRequest;
import com.example.sample.sample.dto.SampleItemResponse;
import com.example.sample.sample.service.SampleItemService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sample-items")
public class SampleItemController {
    private final SampleItemService sampleItemService;

    public SampleItemController(SampleItemService sampleItemService) {
        this.sampleItemService = sampleItemService;
    }

    @GetMapping
    public ApiResponse<List<SampleItemResponse>> findAll(@RequestParam(required = false) String keyword) {
        return ApiResponse.ok(sampleItemService.findAll(keyword));
    }

    @GetMapping("/{id}")
    public ApiResponse<SampleItemResponse> findById(@PathVariable Long id) {
        return ApiResponse.ok(sampleItemService.findById(id));
    }

    @PostMapping
    public ApiResponse<SampleItemResponse> create(@Valid @RequestBody SampleItemRequest request) {
        return ApiResponse.ok(sampleItemService.create(request), "Created");
    }

    @PutMapping("/{id}")
    public ApiResponse<SampleItemResponse> update(@PathVariable Long id, @Valid @RequestBody SampleItemRequest request) {
        return ApiResponse.ok(sampleItemService.update(id, request), "Updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Long>> delete(@PathVariable Long id) {
        sampleItemService.delete(id);
        return ApiResponse.ok(Map.of("id", id), "Deleted");
    }
}
