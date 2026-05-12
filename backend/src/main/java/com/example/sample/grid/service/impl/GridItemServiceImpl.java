package com.example.sample.grid.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.grid.dto.GridItemDto;
import com.example.sample.grid.mapper.GridItemMapper;
import com.example.sample.grid.service.GridItemService;
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
public class GridItemServiceImpl implements GridItemService {

    private static final Logger log = LoggerFactory.getLogger(GridItemServiceImpl.class);

    private final GridItemMapper gridItemMapper;
    private final MessageHandler messageHandler;

    public GridItemServiceImpl(GridItemMapper gridItemMapper, MessageHandler messageHandler) {
        this.gridItemMapper = gridItemMapper;
        this.messageHandler = messageHandler;
    }

    @Override
    public Page<GridItemDto> selectGridItems(GridItemDto dto, Pageable pageable) {
        List<GridItemDto> findAll = gridItemMapper.findAllByGridItemDto(dto, pageable.getOffset(), pageable.getPageSize());
        int totalCount = gridItemMapper.countByGridItemDto(dto);
        return new PageImpl<>(findAll, pageable, totalCount);
    }
}
