package com.example.sample.grid.mapper;

import com.example.sample.grid.dto.GridItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GridItemMapper {

    List<GridItemDto> findAllByGridItemDto(@Param("condition") GridItemDto gridItemDto,
                                           @Param("offset") long offset,
                                           @Param("limit") int limit);

    int countByGridItemDto(@Param("condition") GridItemDto gridItemDto);
}
