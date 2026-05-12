package com.example.sample.tree.mapper;

import com.example.sample.tree.dto.TreeNodeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TreeNodeMapper {

    List<TreeNodeDto> findAllByTreeNodeDto(@Param("dto") TreeNodeDto dto);
}
