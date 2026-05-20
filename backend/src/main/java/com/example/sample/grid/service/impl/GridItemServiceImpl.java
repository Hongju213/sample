package com.example.sample.grid.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.grid.dto.GridItemDto;
import com.example.sample.grid.mapper.GridItemMapper;
import com.example.sample.grid.service.GridItemService;
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
public class GridItemServiceImpl implements GridItemService {

    private final GridItemMapper gridItemMapper;
    private final MessageHandler messageHandler;

    @Override
    public Page<GridItemDto> selectGridItems(GridItemDto gridItemDto, Pageable pageable) {
        List<GridItemDto> findAll = gridItemMapper.findAllByGridItemDto(
                gridItemDto,
                pageable.getOffset(),
                pageable.getPageSize());
        int totalCount = gridItemMapper.countByGridItemDto(gridItemDto);
        return new PageImpl<>(findAll, pageable, totalCount);
    }
}
