package com.example.sample.sample.mapper;

import com.example.sample.sample.domain.SampleItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SampleItemMapper {
    List<SampleItem> findAll(@Param("keyword") String keyword);

    Optional<SampleItem> findById(@Param("id") Long id);

    void insert(SampleItem item);

    int update(SampleItem item);

    int deleteById(@Param("id") Long id);
}
