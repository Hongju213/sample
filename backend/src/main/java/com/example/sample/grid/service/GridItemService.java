package com.example.sample.grid.service;

import com.example.sample.grid.dto.GridItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GridItemService {

    Page<GridItemDto> selectGridItems(GridItemDto dto, Pageable pageable);
}
