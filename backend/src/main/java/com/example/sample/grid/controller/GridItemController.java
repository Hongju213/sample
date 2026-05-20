package com.example.sample.grid.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.grid.dto.GridItemDto;
import com.example.sample.grid.service.GridItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "GridItem", description = "Grid item API")
@RestController
@RequestMapping("/api/grid-items")
@RequiredArgsConstructor
public class GridItemController extends CommonResponse {

    private final GridItemService gridItemService;

    @Operation(summary = "Select grid items")
    @GetMapping
    public ResponseEntity<Page<GridItemDto>> selectGridItems(
            GridItemDto gridItemDto,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<GridItemDto> findAllGridItems = gridItemService.selectGridItems(gridItemDto, pageable);
        return success(findAllGridItems);
    }
}
