package com.example.sample.sample.mapper;

import com.example.sample.sample.dto.SampleItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SampleItemMapper {

    List<SampleItemDto> findAllBySampleItemDto(@Param("dto") SampleItemDto dto,
                                               @Param("offset") long offset,
                                               @Param("limit") int limit);

    int countBySampleItemDto(@Param("dto") SampleItemDto dto);

    Optional<SampleItemDto> findById(@Param("id") Long id);

    void insert(SampleItemDto dto);

    int update(SampleItemDto dto);

    int deleteById(@Param("id") Long id);
}
