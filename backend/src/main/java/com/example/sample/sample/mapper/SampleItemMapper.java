package com.example.sample.sample.mapper;

import com.example.sample.sample.dto.SampleItemDto;
import com.example.sample.sample.dto.SampleItemSearchDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SampleItemMapper {

    List<SampleItemDto> findAllBySampleItemSearchDto(@Param("condition") SampleItemSearchDto sampleItemSearchDto,
                                                     @Param("offset") long offset,
                                                     @Param("limit") int limit);

    int countBySampleItemSearchDto(@Param("condition") SampleItemSearchDto sampleItemSearchDto);

    Optional<SampleItemDto> findById(@Param("id") Long id);

    void insert(SampleItemDto sampleItemDto);

    int update(SampleItemDto sampleItemDto);

    int deleteById(@Param("id") Long id);
}
