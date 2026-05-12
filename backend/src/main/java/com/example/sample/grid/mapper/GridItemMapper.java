package com.example.sample.grid.mapper;

import com.example.sample.grid.dto.GridItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GridItemMapper {

    List<GridItemDto> findAllByGridItemDto(@Param("dto") GridItemDto dto,
                                           @Param("offset") long offset,
                                           @Param("limit") int limit);

    int countByGridItemDto(@Param("dto") GridItemDto dto);
}
