package com.example.sample.grid.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.grid.dto.GridItemDto;
import com.example.sample.grid.service.GridItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "GridItem", description = "그리드 아이템 API")
@RestController
@RequestMapping("/api/grid-items")
public class GridItemController extends CommonResponse {

    private final GridItemService gridItemService;

    public GridItemController(GridItemService gridItemService) {
        this.gridItemService = gridItemService;
    }

    @Operation(summary = "그리드 아이템 목록 조회 (트리 노드 키 기준 페이징)")
    @GetMapping
    public ResponseEntity<Page<GridItemDto>> selectGridItems(
            GridItemDto dto,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<GridItemDto> result = gridItemService.selectGridItems(dto, pageable);
        return success(result);
    }
}
